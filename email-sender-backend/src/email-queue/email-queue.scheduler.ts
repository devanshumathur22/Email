import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"

import {
  EmailQueue,
  EmailQueueDocument,
} from "./email-queue.schema"
import { EmailService } from "../email/email.service"

@Injectable()
export class EmailQueueScheduler {
  private readonly logger = new Logger(EmailQueueScheduler.name)

  constructor(
    @InjectModel(EmailQueue.name)
    private readonly queueModel: Model<EmailQueueDocument>,
    private readonly emailService: EmailService,
  ) {}

  // ⏱ runs every 1 minute
  @Cron("*/1 * * * *")
  async processScheduledQueue() {
    const items = await this.queueModel.find({
      status: "queued",
    })

    if (!items.length) return

    for (const item of items) {
      try {
        // 🔒 HARD LOCK (very important)
        const lock = await this.queueModel.updateOne(
          { _id: item._id, status: "queued" },
          { $set: { status: "processing" } },
        )

        if (lock.modifiedCount === 0) continue

        await this.emailService.sendMail(
          item.userId,
          item.email,
          item.subject || "(No Subject)",
          item.html || "",
          item.campaignId,
        )

        await this.queueModel.updateOne(
          { _id: item._id },
          {
            status: "sent",
            sentAt: new Date(),
          },
        )
      } catch (err: any) {
        await this.queueModel.updateOne(
          { _id: item._id },
          {
            status: "failed",
            failedAt: new Date(),
            lastError: err?.message || "Send failed",
          },
        )

        this.logger.error(
          `❌ Queue send failed ${item.email}`,
          err,
        )
      }
    }
  }
}
