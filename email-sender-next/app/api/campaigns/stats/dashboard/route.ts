
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/models/Campaign';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
    try {
        await dbConnect();

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const userId = decoded.id;

        const totalCampaigns = await Campaign.countDocuments({ userId });

        // Aggregate success and failure counts from all campaigns belonging to user
        const stats = await Campaign.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalSuccess: { $sum: "$successCount" },
                    totalFailure: { $sum: "$failureCount" },
                }
            }
        ]);

        const result = {
            totalCampaigns,
            emails: {
                success: stats[0]?.totalSuccess || 0,
                failure: stats[0]?.totalFailure || 0,
            }
        };

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
