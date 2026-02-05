import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type EmailQueueDocument = EmailQueue & Document

@Schema({
  timestamps: true,
  strict: true,
})
export class EmailQueue {
  /* ===== OWNER ===== */
  @Prop({ required: true, index: true })
  userId: string

  /* ===== EMAIL ===== */
  @Prop({ required: true, index: true })
  email: string

  @Prop()
  subject?: string

  @Prop()
  html?: string

  @Prop()
  footer?: string

  /* ===== CAMPAIGN LINK ===== */
  @Prop({ index: true })
  campaignId?: string

  /* ===== QUEUE STATUS ===== */
  @Prop({
    type: String,
    enum: [
      "draft",       // manual queue (before convert/send)
      "queued",      // waiting for cron
      "processing",  // 🔒 locked by worker
      "sent",
      "failed",
      "converted",   // moved into campaign
    ],
    default: "draft",
    index: true,
  })
  status:
    | "draft"
    | "queued"
    | "processing"
    | "sent"
    | "failed"
    | "converted"

  /* ===== TIME ===== */
  @Prop()
  queuedAt?: Date

  @Prop()
  sentAt?: Date

  @Prop()
  failedAt?: Date

  /* ===== RETRY ===== */
  @Prop({ default: 0 })
  retryCount: number

  /* ===== ERROR ===== */
  @Prop()
  lastError?: string
}

export const EmailQueueSchema =
  SchemaFactory.createForClass(EmailQueue)
