import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"

import {
  Campaign,
  CampaignDocument,
  CampaignStatus,
} from "./campaign.schema"
import { CampaignsService } from "./campaigns.service"

@Injectable()
export class CampaignsCron {
  private readonly logger = new Logger(CampaignsCron.name)

  constructor(
    @InjectModel(Campaign.name)
    private readonly campaignModel: Model<CampaignDocument>,
    private readonly campaignsService: CampaignsService,
  ) {}

 /* ================= SCHEDULED CAMPAIGNS ================= */
// ⏰ every 20 seconds
@Cron("*/20 * * * * *")
async triggerScheduledCampaigns() {
  const now = new Date()

  const campaigns = await this.campaignModel.find({
    status: CampaignStatus.PENDING, // 🔥 FIXED
    paused: false,
    scheduledAt: { $lte: now },
  })

  if (!campaigns.length) return

  for (const campaign of campaigns) {
    try {
      // 🔒 atomic lock
      const locked = await this.campaignModel.updateOne(
        {
          _id: campaign._id,
          status: CampaignStatus.PENDING,
        },
        {
          status: CampaignStatus.SENDING,
          sentAt: null,
        },
      )

      if (locked.modifiedCount === 0) continue

      this.logger.log(
        `⏰ Scheduled campaign started: ${campaign._id}`,
      )

      await this.campaignsService.sendCampaign(campaign)
    } catch (err: any) {
      await this.campaignModel.updateOne(
        { _id: campaign._id },
        { status: CampaignStatus.FAILED },
      )

      this.logger.error(
        `❌ Scheduled campaign failed ${campaign._id}`,
        err,
      )
    }
  }
}


  /* ================= EMAIL QUEUE WORKER ================= */
  // ⚡ every 20 seconds
  @Cron("*/20 * * * * *")
  async processQueue() {
    this.logger.log("📤 Processing email queue (20s)")
    await this.campaignsService.processEmailQueue()
  }
}
