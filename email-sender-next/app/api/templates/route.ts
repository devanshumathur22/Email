
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Template from '@/models/Template';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, subject, html, category } = await req.json();

        if (!name || !subject || !html) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const template = await Template.create({
            name,
            subject,
            html,
            category,
        });

        return NextResponse.json(template, { status: 201 });
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
        const templates = await Template.find({}).sort({ createdAt: -1 });
        return NextResponse.json(templates);
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}
