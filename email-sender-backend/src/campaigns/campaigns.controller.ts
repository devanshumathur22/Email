import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Query,
  Res,
  Delete,
  BadRequestException,
  UseGuards,
  Req,
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import type { Response } from "express"

import {
  Campaign,
  CampaignDocument,
  CampaignStatus,
} from "./campaign.schema"
import {
  CampaignRecipient,
  CampaignRecipientDocument,
} from "./campaign-recipient.schema"
import { CampaignsService } from "./campaigns.service"
import { EmailQueueService } from "../email-queue/email-queue.service"
import { JwtAuthGuard } from "../auth/jwt.guard"

@Controller("campaigns")
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,

    @InjectModel(CampaignRecipient.name)
    private readonly recipientModel: Model<CampaignRecipientDocument>,

    private readonly emailQueueService: EmailQueueService,
    private readonly campaignsService: CampaignsService,
  ) {}

  /* ================= TRACKING ================= */

  @Get("email/open/:campaignId")
  async trackOpen(
    @Param("campaignId") campaignId: string,
    @Res() res: Response,
  ) {
    await this.campaignsService.trackOpen(campaignId)

    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
      "base64",
    )

    res.set({ "Content-Type": "image/gif" })
    res.end(pixel)
  }

  @Get("email/click/:campaignId")
  async trackClick(
    @Param("campaignId") campaignId: string,
    @Query("url") url: string,
    @Res() res: Response,
  ) {
    await this.campaignsService.trackClick(campaignId)
    return res.redirect(url)
  }

  /* ================= CREATE ================= */

  @Post()
  async create(@Req() req, @Body() body: any) {
    if (!body.subject || !body.html) {
      throw new BadRequestException("Subject & body required")
    }

    const campaign = await this.campaignsService.create({
      name: body.subject,
      subject: body.subject,
      html: body.html,
      footer: body.footer,
      userId: req.user.id,
    })

    return { id: campaign._id }
  }

  /* ================= SEND NOW ================= */

  @Post(":id/send-now")
  async sendNow(@Req() req, @Param("id") id: string) {
    const campaign = await this.campaignModel.findOne({
      _id: id,
      userId: req.user.id,
      status: CampaignStatus.DRAFT,
    })

    if (!campaign) {
      throw new BadRequestException("Campaign not sendable")
    }

    await this.campaignModel.updateOne(
      { _id: id },
      {
        status: CampaignStatus.SENDING,
        paused: false,
        sentAt: null,
      },
    )

    await this.campaignsService.sendCampaign(campaign)

    return { message: "Campaign sending started" }
  }

  /* ================= PAUSE / RESUME ================= */

  @Post(":id/pause")
  async pause(@Req() req, @Param("id") id: string) {
    const result = await this.campaignModel.updateOne(
      {
        _id: id,
        userId: req.user.id,
        status: CampaignStatus.SENDING,
      },
      { paused: true },
    )

    if (!result.modifiedCount) {
      throw new BadRequestException("Campaign not pausable")
    }

    return { message: "Campaign paused" }
  }

  @Post(":id/resume")
  async resume(@Req() req, @Param("id") id: string) {
    const result = await this.campaignModel.updateOne(
      {
        _id: id,
        userId: req.user.id,
        paused: true,
      },
      {
        paused: false,
        status: CampaignStatus.SENDING,
      },
    )

    if (!result.modifiedCount) {
      throw new BadRequestException("Campaign not resumable")
    }

    return { message: "Campaign resumed" }
  }

  /* ================= SCHEDULE ================= */

  /* ================= SCHEDULE / RESCHEDULE ================= */

@Post(":id/schedule")
async schedule(
  @Req() req,
  @Param("id") id: string,
  @Body("scheduledAt") scheduledAt: string,
) {
  const date = new Date(scheduledAt)

  if (!scheduledAt || isNaN(date.getTime())) {
    throw new BadRequestException("Invalid scheduled date")
  }

  await this.campaignModel.updateOne(
    { _id: id, userId: req.user.id },
    {
      status: CampaignStatus.PENDING,
      scheduledAt: date,
      paused: false,
    },
  )

  return {
    message: "Campaign scheduled",
    scheduledAt: date,
  }
}

  /* ================= RESCHEDULE ================= */

  @Patch(":id/reschedule")
async reschedule(
  @Req() req,
  @Param("id") id: string,
  @Body("scheduledAt") scheduledAt: string,
) {
  const date = new Date(scheduledAt)

  if (!scheduledAt || isNaN(date.getTime())) {
    throw new BadRequestException("Invalid date")
  }

  await this.campaignModel.updateOne(
    { _id: id, userId: req.user.id },
    {
      status: CampaignStatus.PENDING,
      scheduledAt: date,
      paused: false,
    },
  )

  return {
    message: "Campaign rescheduled",
    scheduledAt: date,
  }
}

  /* ================= RETRY FAILED ================= */

  @Post(":id/retry-failed")
  retryFailed(@Req() req, @Param("id") id: string) {
    return this.campaignsService.retryFailedRecipients(
      id,
      req.user.id,
    )
  }

  /* ================= LIST ================= */

  @Get()
  getAll(@Req() req) {
    return this.campaignModel
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
  }

  /* ================= ANALYTICS ================= */

  @Get(":id/analytics/summary")
  analytics(@Req() req, @Param("id") id: string) {
    return this.campaignsService.getCampaignAnalyticsSummary(
      id,
      req.user.id,
    )
  }

  /* ================= DELETE ================= */

  @Delete(":id")
  async delete(@Req() req, @Param("id") id: string) {
    await this.campaignModel.deleteOne({
      _id: id,
      userId: req.user.id,
    })

    await this.recipientModel.deleteMany({
      campaignId: id,
    })

    return { message: "Deleted" }
  }

  /* ================= QUEUE → CAMPAIGN ================= */

  @Post("convert-to-campaign")
  convertToCampaign(
    @Req() req,
    @Body() body: { queueIds: string[] },
  ) {
    return this.emailQueueService.convertToCampaign(
      req.user.id,
      body.queueIds,
    )
  }

  /* ================= DASHBOARD ================= */

  @Get("stats/dashboard")
  dashboardStats(@Req() req) {
    return this.campaignsService.dashboardStats(req.user.id)
  }
}
