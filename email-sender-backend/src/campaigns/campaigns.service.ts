import {
  Injectable,
  Logger,
  BadRequestException,
  
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"

import { Campaign, CampaignDocument } from "./campaign.schema"
import {
  CampaignRecipient,
  CampaignRecipientDocument,
} from "./campaign-recipient.schema"
import { EmailService } from "../email/email.service"
import { EmailQueue, EmailQueueDocument } from "../email-queue/email-queue.schema"

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name)

  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,

    @InjectModel(CampaignRecipient.name)
    private readonly recipientModel: Model<CampaignRecipientDocument>,

    @InjectModel(EmailQueue.name)
    private readonly emailQueueModel: Model<EmailQueueDocument>,

    private readonly emailService: EmailService,
  ) {}

  /* ================= CREATE ================= */
  async create(data: {
    name: string
    subject: string
    html: string
    footer?: string
    userId: string
    source?: "manual" | "queue"
    queueCount?: number
  }) {
    return this.campaignModel.create({
      name: data.name,
      subject: data.subject,
      html: data.html,
      footer: data.footer,
      userId: data.userId,
      source: data.source ?? "manual",
      queueCount: data.queueCount ?? 0,
      status: "draft",
      paused: false,
      totalRecipients: data.queueCount ?? 0,
      successCount: 0,
      failureCount: 0,
    })
  }

  /* ================= ATTACH RECIPIENTS ================= */
  async attachRecipients(campaignId: string, emails: string[]) {
  if (!Array.isArray(emails) || !emails.length) {
    return
  }

  // 🔒 normalize + clean emails
  const cleaned = emails
    .map(e => e?.trim().toLowerCase())
    .filter(Boolean)

  if (!cleaned.length) return

  // 🔥 insert safely (skip duplicates)
  await this.recipientModel.insertMany(
    cleaned.map(email => ({
      campaignId,
      email,
      status: "pending",
    })),
    { ordered: false }, // prevents crash on duplicate
  )

  // 🔄 update total count from DB (accurate count)
  const total = await this.recipientModel.countDocuments({
    campaignId,
  })

  await this.campaignModel.updateOne(
    { _id: campaignId },
    { totalRecipients: total },
  )
}

  /* ================= QUEUE → CAMPAIGN ================= */
  async convertToCampaign(userId: string, queueIds: string[]) {
    if (!queueIds.length) {
      throw new BadRequestException("No emails selected")
    }

    const items = await this.emailQueueModel.find({
      _id: { $in: queueIds },
      userId,
      status: "draft",
    })

    if (!items.length) {
      throw new BadRequestException("Queue empty")
    }

    const campaign = await this.create({
      name: items[0].subject || "Queue Campaign",
      subject: items[0].subject || "",
      html: items[0].html || "",
      userId,
      source: "queue",
      queueCount: items.length,
    })

    await this.attachRecipients(
      campaign._id.toString(),
      items.map((i) => i.email),
    )

    await this.emailQueueModel.updateMany(
      { _id: { $in: queueIds }, userId },
      {
        status: "converted",
        campaignId: campaign._id.toString(),
      },
    )

    return {
      message: "Queue converted to campaign",
      campaignId: campaign._id.toString(),
      count: items.length,
    }
  }

  /* ================= SEND CAMPAIGN ================= */
  async sendCampaign(campaign: CampaignDocument) {
    if (campaign.paused) return

    const recipients = await this.recipientModel.find({
      campaignId: campaign._id.toString(),
      status: "pending",
    })

    if (!recipients.length) {
      throw new BadRequestException("No recipients to send")
    }

    await this.campaignModel.updateOne(
      { _id: campaign._id },
      { status: "sending", sentAt: null },
    )

    await this.emailQueueModel.insertMany(
      recipients.map((r) => ({
        userId: campaign.userId,
        campaignId: campaign._id.toString(),
        email: r.email,
        subject: campaign.subject,
        html: campaign.html,
        status: "queued",
        retryCount: 0,
        queuedAt: new Date(),
      })),
    )
  }

  /* ================= PROCESS EMAIL QUEUE ================= */
 async processEmailQueue() {
  const jobs = await this.emailQueueModel
    .find({ status: "queued" })
    .limit(10)

  for (const job of jobs) {
    // 🔐 atomic lock
    const locked = await this.emailQueueModel.updateOne(
      { _id: job._id, status: "queued" },
      { $set: { status: "processing" } },
    )

    if (locked.modifiedCount === 0) continue

    const campaign = await this.campaignModel.findById(job.campaignId)

    // 🚨 If campaign missing
    if (!campaign) {
      await this.emailQueueModel.updateOne(
        { _id: job._id },
        {
          status: "failed",
          lastError: "Campaign not found",
          failedAt: new Date(),
        },
      )
      continue
    }

    // ⏸ If paused → revert back to queued
    if (campaign.paused) {
      await this.emailQueueModel.updateOne(
        { _id: job._id },
        { status: "queued" },
      )
      continue
    }

    try {
      await this.emailService.sendMail(
        job.userId,
        job.email,
        job.subject || "(No Subject)",
        job.html || "",
        job.campaignId,
      )

      await Promise.all([
        this.emailQueueModel.updateOne(
          { _id: job._id },
          {
            status: "sent",
            sentAt: new Date(),
            lastError: null,
          },
        ),
        this.recipientModel.updateOne(
          { campaignId: job.campaignId, email: job.email },
          { status: "sent", sentAt: new Date() },
        ),
        this.campaignModel.updateOne(
          { _id: job.campaignId },
          { $inc: { successCount: 1 } },
        ),
      ])
    } catch (err: any) {
      await Promise.all([
        this.emailQueueModel.updateOne(
          { _id: job._id },
          {
            status: "failed",
            failedAt: new Date(),
            lastError: err?.message || "Unknown error",
          },
        ),
        this.recipientModel.updateOne(
          { campaignId: job.campaignId, email: job.email },
          {
            status: "failed",
            failedReason: err?.message || "Unknown error",
          },
        ),
        this.campaignModel.updateOne(
          { _id: job.campaignId },
          { $inc: { failureCount: 1 } },
        ),
      ])
    }
  }

  // 🔥 Finalize campaigns automatically
  const sendingCampaigns = await this.campaignModel.find({
    status: "sending",
  })

  for (const c of sendingCampaigns) {
    const remaining = await this.emailQueueModel.countDocuments({
      campaignId: c._id.toString(),
      status: { $in: ["queued", "processing"] },
    })

    if (remaining === 0) {
      await this.campaignModel.updateOne(
        { _id: c._id },
        {
          status: "sent",
          sentAt: new Date(),
          paused: false,
        },
      )
    }
  }

  /* ================= FINALIZE CAMPAIGNS ================= */
  const sending = await this.campaignModel.find({ status: "sending" })

  for (const c of sending) {
    const pending = await this.emailQueueModel.countDocuments({
      campaignId: c._id.toString(),
      status: { $in: ["queued", "processing"] },
    })

    if (pending === 0 && c.status === "sending") {
      await this.campaignModel.updateOne(
        { _id: c._id },
        {
          status: "sent",
          sentAt: new Date(),
          paused: false,
        },
      )
    }
  }
}

// Retry 
async rescheduleCampaign(
  campaignId: string,
  userId: string,
  scheduledAt: Date,
) {
  const campaign = await this.campaignModel.findOne({
    _id: campaignId,
    userId,
  })

  if (!campaign) {
    throw new BadRequestException("Campaign not found")
  }

  if (campaign.status !== "draft") {
    throw new BadRequestException(
      "Only draft campaigns can be scheduled",
    )
  }

  await this.campaignModel.updateOne(
    { _id: campaignId },
    {
      scheduledAt: new Date(scheduledAt),
      status: "pending",
      paused: false,
    },
  )

  return { message: "Campaign scheduled successfully" }
}





  /* ================= RETRY FAILED ================= */
  async retryFailedRecipients(campaignId: string, userId: string) {
    const failed = await this.recipientModel.find({
      campaignId,
      status: "failed",
    })

    if (!failed.length) {
      return { message: "No failed recipients" }
    }

    const campaign = await this.campaignModel.findOne({
      _id: campaignId,
      userId,
    })

    if (!campaign) {
      throw new BadRequestException("Campaign not found")
    }

    await this.recipientModel.updateMany(
      { campaignId, status: "failed" },
      { status: "pending", failedReason: null },
    )

    await this.emailQueueModel.insertMany(
      failed.map((r) => ({
        userId,
        campaignId,
        email: r.email,
        subject: campaign.subject,
        html: campaign.html,
        status: "queued",
        retryCount: 1,
        queuedAt: new Date(),
      })),
    )

    await this.campaignModel.updateOne(
      { _id: campaignId },
      { status: "sending", paused: false },
    )

    return { message: "Retry started", count: failed.length }
  }

  /* ================= ANALYTICS ================= */
  async getCampaignAnalyticsSummary(campaignId: string, userId: string) {
    const campaign = await this.campaignModel.findOne({
      _id: campaignId,
      userId,
    })

    if (!campaign) {
      throw new BadRequestException("Campaign not found")
    }

    return {
      total: campaign.totalRecipients,
      sent: campaign.successCount,
      failed: campaign.failureCount,
      pending:
        campaign.totalRecipients -
        (campaign.successCount + campaign.failureCount),
      progress: `${campaign.successCount + campaign.failureCount}/${campaign.totalRecipients}`,
    }
  }

  /* ================= TRACKING ================= */
  async trackOpen(campaignId: string) {
    await this.campaignModel.updateOne(
      { _id: campaignId },
      { $inc: { openCount: 1 }, lastOpenedAt: new Date() },
    )
  }

  async trackClick(campaignId: string) {
    await this.campaignModel.updateOne(
      { _id: campaignId },
      { $inc: { clickCount: 1 } },
    )
  }

  /* ================= DASHBOARD ================= */
  async dashboardStats(userId: string) {
    const campaigns = await this.campaignModel.find({ userId })

    let success = 0
    let failure = 0

    campaigns.forEach((c) => {
      success += c.successCount || 0
      failure += c.failureCount || 0
    })

    return {
      totalCampaigns: campaigns.length,
      emails: { success, failure },
    }
  }

  async updateCampaign(
  campaignId: string,
  userId: string,
  data: Partial<Campaign>,
) {
  const result = await this.campaignModel.updateOne(
    { _id: campaignId, userId },
    data,
  )

  if (!result.modifiedCount) {
    throw new BadRequestException("Campaign not updated")
  }

  return { message: "Campaign updated" }
}

}
