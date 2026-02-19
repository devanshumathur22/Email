
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
    email: string;
    name: string;
    groupId?: string;
    active: boolean;
}

const ContactSchema = new Schema<IContact>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        groupId: { type: String, default: null },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
export default Contact;
