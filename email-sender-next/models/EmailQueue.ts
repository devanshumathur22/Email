
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailQueue extends Document {
    userId: string;
    email: string;
    subject?: string;
    html?: string;
    footer?: string;
    campaignId?: string;
    status: "draft" | "queued" | "processing" | "sent" | "failed" | "converted";
    queuedAt?: Date;
    sentAt?: Date;
    failedAt?: Date;
    retryCount: number;
    lastError?: string;
}

const EmailQueueSchema = new Schema<IEmailQueue>(
    {
        userId: { type: String, required: true, index: true },
        email: { type: String, required: true, index: true },
        subject: String,
        html: String,
        footer: String,
        campaignId: { type: String, index: true },
        status: {
            type: String,
            enum: ["draft", "queued", "processing", "sent", "failed", "converted"],
            default: "draft",
            index: true,
        },
        queuedAt: Date,
        sentAt: Date,
        failedAt: Date,
        retryCount: { type: Number, default: 0 },
        lastError: String,
    },
    { timestamps: true, strict: true }
);

const EmailQueue: Model<IEmailQueue> = mongoose.models.EmailQueue || mongoose.model<IEmailQueue>('EmailQueue', EmailQueueSchema);
export default EmailQueue;
