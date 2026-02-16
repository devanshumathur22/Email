
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        await dbConnect();

        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch (error) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const { host, port, user, pass } = await req.json();

        // 1. Verify SMTP credentials using Nodemailer
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port == 465, // strict check
            auth: { user, pass },
        });

        try {
            await transporter.verify();
        } catch (smtpError: any) {
            return NextResponse.json({
                message: 'SMTP Verification Failed',
                error: smtpError.message
            }, { status: 400 });
        }

        // 2. Save to database if verified
        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { smtp: { host, port, user, pass } },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'SMTP settings saved', user: updatedUser });

    } catch (error: any) {
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}
