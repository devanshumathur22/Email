
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EmailQueue from '@/models/EmailQueue';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId, email, subject, html, campaignId } = await req.json();

        if (!userId || !email || !subject || !html) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const queueItem = await EmailQueue.create({
            userId,
            email,
            subject,
            html,
            campaignId,
            status: 'queued',
            queuedAt: new Date(),
        });

        return NextResponse.json(queueItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        // Just fetch queued or processing for display/workers
        const queue = await EmailQueue.find({ status: { $in: ['queued', 'processing', 'failed'] } }).sort({ queuedAt: 1 });
        return NextResponse.json(queue);
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}
