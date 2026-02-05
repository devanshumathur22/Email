import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type CampaignDocument = Campaign & Document

export enum CampaignStatus {
  DRAFT = "draft",
   PENDING = "pending", 
  SENDING = "sending",
  SENT = "sent",
  FAILED = "failed",
}

@Schema({
  timestamps: true,
  strict: true, // 🔒 important – unknown fields block
})
export class Campaign {
  /* ===== BASIC ===== */
  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  subject: string

  @Prop({ required: true })
  html: string

  @Prop()
  footer?: string

  /* ===== OWNER ===== */
  @Prop({ required: true, index: true })
  userId: string

  /* ===== STATUS ===== */
  @Prop({
    type: String,
    enum: Object.values(CampaignStatus),
    default: CampaignStatus.DRAFT,
    index: true,
  })
  status: CampaignStatus

  @Prop({ default: false, index: true })
  paused: boolean

  /* ===== SOURCE ===== */
  @Prop({
    type: String,
    enum: ["manual", "queue"],
    default: "manual",
    index: true,
  })
  source: "manual" | "queue"

  /* ===== COUNTS ===== */
  @Prop({ default: 0 })
  totalRecipients: number   // total emails in campaign

  @Prop({ default: 0 })
  successCount: number      // sent successfully

  @Prop({ default: 0 })
  failureCount: number      // failed sends

  @Prop({ default: 0 })
  queueCount: number        // 🔥 how many came from queue

  /* ===== TIME ===== */
  @Prop()
  scheduledAt?: Date

  @Prop()
  sentAt?: Date
}

export const CampaignSchema =
  SchemaFactory.createForClass(Campaign)
