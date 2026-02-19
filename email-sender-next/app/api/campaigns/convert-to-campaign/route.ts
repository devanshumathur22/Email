
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import EmailQueue from "@/models/EmailQueue";
import Campaign from "@/models/Campaign";
import CampaignRecipient from "@/models/CampaignRecipient";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const token = authHeader.split(" ")[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const { queueIds } = await req.json();

        if (!Array.isArray(queueIds) || queueIds.length === 0) {
            return NextResponse.json({ message: "No queue ids provided" }, { status: 400 });
        }

        const queueItems = await EmailQueue.find({
            _id: { $in: queueIds },
            userId: decoded.id
        });

        if (queueItems.length === 0) {
            return NextResponse.json({ message: "No valid queue items found" }, { status: 404 });
        }

        // Use the first item's content for the campaign
        const template = queueItems[0];

        const campaign = await Campaign.create({
            userId: decoded.id,
            subject: template.subject,
            html: template.html,
            status: "draft",
            createdAt: new Date(),
        });

        const recipients = queueItems.map(item => ({
            campaignId: campaign._id,
            email: item.email,
            status: "pending"
        }));

        await CampaignRecipient.insertMany(recipients);

        // Optionally update queue status or delete them?
        // Usually "converting" implies moving them.
        await EmailQueue.updateMany(
            { _id: { $in: queueIds } },
            { status: "converted" }
        );

        return NextResponse.json({
            message: "Campaign created",
            campaignId: campaign._id
        });

    } catch (error: any) {
        return NextResponse.json(
            { message: "Conversion failed", error: error.message },
            { status: 500 }
        );
    }
}
