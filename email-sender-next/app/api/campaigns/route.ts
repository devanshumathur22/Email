
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Campaign from '@/models/Campaign';
// import { auth } from '@/auth'; // You would need proper middleware or server-sida auth check

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { name, subject, html, userId, status } = await req.json();

        // In a real app, verify user session here 
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const newCampaign = await Campaign.create({
            name,
            subject,
            html,
            userId,
            status
        });

        return NextResponse.json(newCampaign, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbConnect();
    try {
        // For now fetching all, but should be filtered by user
        const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
        return NextResponse.json(campaigns);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
