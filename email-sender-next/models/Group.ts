
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    contactIds: string[];
    contacts?: mongoose.Types.ObjectId[];
    groups?: mongoose.Types.ObjectId[];
}

const GroupSchema = new Schema<IGroup>(
    {
        name: { type: String, required: true },
        contactIds: { type: [String], default: [] },
        contacts: { type: [{ type: Schema.Types.ObjectId, ref: "Contact" }] },
        groups: { type: [{ type: Schema.Types.ObjectId, ref: "Group" }] },
    },
    { timestamps: true }
);

const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export default Group;
