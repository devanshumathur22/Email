
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITemplate extends Document {
    name: string;
    subject: string;
    html: string;
    category: string;
    favorite: boolean;
    variantOf?: string;
    isFavorite: boolean;
    abGroup?: "A" | "B";
    aiGenerated: boolean;
    description?: string;
    opens: number;
    clicks: number;
    status: "draft" | "active" | "archived";
    createdBy?: string;
}

const TemplateSchema = new Schema<ITemplate>(
    {
        name: { type: String, required: true },
        subject: { type: String, required: true },
        html: { type: String, required: true },
        category: { type: String, default: "general" },
        favorite: { type: Boolean, default: false },
        variantOf: { type: String, default: null },
        isFavorite: { type: Boolean, default: false },
        abGroup: {
            type: String,
            enum: ["A", "B"],
        },
        aiGenerated: { type: Boolean, default: false },
        description: { type: String },
        opens: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["draft", "active", "archived"],
            default: "active",
        },
        createdBy: { type: String },
    },
    { timestamps: true }
);

const Template: Model<ITemplate> = mongoose.models.Template || mongoose.model<ITemplate>('Template', TemplateSchema);
export default Template;
