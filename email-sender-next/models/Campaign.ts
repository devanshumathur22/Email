
import mongoose, { Schema, Document, Model } from 'mongoose';

export enum CampaignStatus {
    DRAFT = "draft",
    PENDING = "pending",
    SENDING = "sending",
    SENT = "sent",
    FAILED = "failed",
    SCHEDULED = "scheduled",
}

export interface ICampaign extends Document {
    name: string;
    subject: string;
    html: string;
    footer?: string;
    userId: string;
    status: CampaignStatus;
    paused: boolean;
    source: "manual" | "queue";
    totalRecipients: number;
    successCount: number;
    failureCount: number;
    queueCount: number;
    scheduledAt?: Date;
    sentAt?: Date;
}

const CampaignSchema = new Schema<ICampaign>(
    {
        name: { type: String, required: true },
        subject: { type: String, required: true },
        html: { type: String, required: true },
        footer: { type: String },
        userId: { type: String, required: true, index: true },
        status: {
            type: String,
            enum: Object.values(CampaignStatus),
            default: CampaignStatus.DRAFT,
            index: true,
        },
        paused: { type: Boolean, default: false, index: true },
        source: {
            type: String,
            enum: ["manual", "queue"],
            default: "manual",
            index: true,
        },
        totalRecipients: { type: Number, default: 0 },
        successCount: { type: Number, default: 0 },
        failureCount: { type: Number, default: 0 },
        queueCount: { type: Number, default: 0 },
        scheduledAt: { type: Date },
        sentAt: { type: Date },
    },
    { timestamps: true, strict: true }
);

const Campaign: Model<ICampaign> = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
export default Campaign;
