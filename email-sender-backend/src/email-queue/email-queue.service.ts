import {
  Injectable,
  Inject,
  forwardRef,
  BadRequestException,
  Logger,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import csv from "csvtojson"

import { EmailQueue, EmailQueueDocument } from "./email-queue.schema"
import { CampaignsService } from "../campaigns/campaigns.service"

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name)

  constructor(
    @InjectModel(EmailQueue.name)
    private readonly model: Model<EmailQueueDocument>,

    @Inject(forwardRef(() => CampaignsService))
    private readonly campaigns: CampaignsService,
  ) {}

  /* ================= LIST ================= */
  async findAll(userId: string) {
    return this.model.find({ userId }).sort({ createdAt: -1 })
  }

  async count(userId: string) {
    return this.model.countDocuments({ userId })
  }

  /* ================= CSV UPLOAD ================= */
  async processCSV(
    userId: string,
    file: Express.Multer.File,
    mode: "append" | "replace" = "append",
  ) {
    const rows = await csv().fromString(file.buffer.toString())

    if (mode === "replace") {
      await this.model.deleteMany({ userId })
    }

    const emails = rows
      .filter(r => r.email)
      .map(r => r.email.trim().toLowerCase())

    const existing = await this.model.find(
      { userId, email: { $in: emails } },
      { email: 1 },
    )

    const existingSet = new Set(
      existing.map(e => e.email.toLowerCase()),
    )

    const docs = rows
      .filter(
        r =>
          r.email &&
          !existingSet.has(r.email.trim().toLowerCase()),
      )
      .map(r => ({
        userId,
        email: r.email.trim().toLowerCase(),
        subject: r.subject || "",
        html: r.body_html || "<p>Hello</p>",
        footer: r.footer || "",
        status: "draft", // 🔥 ONLY draft here
      }))

    if (docs.length) {
      await this.model.insertMany(docs)
    }

    return {
      totalCsv: emails.length,
      added: docs.length,
      skipped: emails.length - docs.length,
    }
  }

  /* ================= UPDATE ONE ================= */
  async update(userId: string, id: string, data: any) {
    return this.model.findOneAndUpdate(
      { _id: id, userId, status: "draft" }, // 🔒 editable only in draft
      data,
      { new: true },
    )
  }

  /* ================= CONVERT QUEUE → CAMPAIGN ================= */
  async convertToCampaign(userId: string, ids: string[]) {
    if (!ids?.length) {
      throw new BadRequestException("No emails selected")
    }

    const rows = await this.model.find({
      _id: { $in: ids },
      userId,
      status: "draft",
    })

    if (!rows.length) {
      throw new BadRequestException("Queue empty")
    }

    const subject = rows[0].subject || "Queue Campaign"
    const html = rows[0].html || "<p>Queue Campaign</p>"

    const campaign = await this.campaigns.create({
      name: `Queue Campaign ${Date.now()}`,
      subject,
      html,
      userId,
      source: "queue",
      queueCount: rows.length,
    })

    // ✅ attach recipients to campaign
    await this.campaigns.attachRecipients(
      campaign._id.toString(),
      rows.map(r => r.email),
    )

    // ✅ mark queue rows as converted (audit safe)
    await this.model.updateMany(
      { _id: { $in: ids }, userId },
      {
        status: "converted",
        campaignId: campaign._id.toString(),
      },
    )

    return {
      message: "Queue converted to campaign",
      campaignId: campaign._id.toString(),
      count: rows.length,
    }
  }

  /* ================= DELETE ================= */
  async deleteOne(userId: string, id: string) {
    return this.model.deleteOne({
      _id: id,
      userId,
      status: "draft", // 🔒 only draft deletable
    })
  }

  async deleteMany(userId: string, ids: string[]) {
    return this.model.deleteMany({
      _id: { $in: ids },
      userId,
      status: "draft",
    })
  }

  async deleteAll(userId: string) {
    return this.model.deleteMany({
      userId,
      status: "draft",
    })
  }
}
