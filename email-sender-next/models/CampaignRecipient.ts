
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICampaignRecipient extends Document {
    campaignId: string;
    email: string;
    status: "pending" | "sent" | "failed";
    sentAt?: Date;
    failedReason?: string;
    html?: string;
}

const CampaignRecipientSchema = new Schema<ICampaignRecipient>(
    {
        campaignId: { type: String, required: true, index: true },
        email: { type: String, required: true, lowercase: true, index: true },
        status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending",
            required: true,
            index: true,
        },
        sentAt: { type: Date },
        failedReason: { type: String },
        html: { type: String },
    },
    { timestamps: true }
);

// Prevent duplicate emails in same campaign
CampaignRecipientSchema.index(
    { campaignId: 1, email: 1 },
    { unique: true }
);

const CampaignRecipient: Model<ICampaignRecipient> = mongoose.models.CampaignRecipient || mongoose.model<ICampaignRecipient>('CampaignRecipient', CampaignRecipientSchema);
export default CampaignRecipient;
