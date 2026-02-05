import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type CampaignRecipientDocument =
  CampaignRecipient & Document

@Schema({ timestamps: true })
export class CampaignRecipient {
  // 🔗 Parent campaign
  @Prop({ required: true, index: true })
  campaignId: string

  // 📧 Receiver email
  @Prop({ required: true, lowercase: true, index: true })
  email: string

  /**
   * ✅ SINGLE SOURCE OF TRUTH
   * pending  → not yet sent
   * sent     → delivered successfully
   * failed   → delivery failed
   */
  @Prop({
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
    required: true,
    index: true,
  })
  status: "pending" | "sent" | "failed"

  // ⏱ when mail was sent
  @Prop()
  sentAt?: Date

  // ❌ failure reason (if any)
  @Prop()
  failedReason?: string

  // 📨 stored for preview / audit
  @Prop()
  html?: string
}

export const CampaignRecipientSchema =
  SchemaFactory.createForClass(CampaignRecipient)

// 🔒 Prevent duplicate emails in same campaign
CampaignRecipientSchema.index(
  { campaignId: 1, email: 1 },
  { unique: true }
)
