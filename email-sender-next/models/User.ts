
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpVerified: boolean;
    smtp?: {
        host: string;
        port: number;
        user: string;
        pass: string;
        secure: boolean;
        verified: boolean;
        addedAt: Date;
    };
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        smtpHost: { type: String },
        smtpPort: { type: Number },
        smtpUser: { type: String },
        smtpPass: { type: String },
        smtpVerified: { type: Boolean, default: false },
        smtp: {
            type: {
                host: String,
                port: Number,
                user: String,
                pass: String,
                secure: Boolean,
                verified: { type: Boolean, default: false },
                addedAt: Date,
            },
            _id: false, // Prevents creating a separate _id for the smtp subdocument
        },
    },
    { timestamps: true }
);

// Prevent overwriting the model if it already exists (Next.js hot reload issue fix)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
