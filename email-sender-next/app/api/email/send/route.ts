
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CampaignRecipient from '@/models/CampaignRecipient';

// Helper to configure transporter
const createTransporter = (smtpConfig: any) => {
    return nodemailer.createTransport({
        host: smtpConfig.host || process.env.SMTP_HOST,
        port: Number(smtpConfig.port || process.env.SMTP_PORT),
        secure: smtpConfig.secure !== false, // default true if not specified
        auth: {
            user: smtpConfig.user || process.env.SMTP_USER,
            pass: smtpConfig.pass || process.env.SMTP_PASS,
        },
    });
};

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId, campaignId, recipientEmail, subject, html } = await req.json();

        if (!userId || !recipientEmail || !subject || !html) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // 1. Get User SMTP settings
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const smtpConfig = user.smtp || {
            host: user.smtpHost,
            port: user.smtpPort,
            user: user.smtpUser,
            pass: user.smtpPass,
        };

        if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
            return NextResponse.json({ message: 'SMTP configuration missing for user' }, { status: 400 });
        }

        // 2. Create Transporter
        const transporter = createTransporter(smtpConfig);

        // 3. Send Email
        const info = await transporter.sendMail({
            from: `"${user.name}" <${smtpConfig.user}>`,
            to: recipientEmail,
            subject: subject,
            html: html,
        });

        // 4. Log Success in CampaignRecipient if campaignId exists
        if (campaignId) {
            await CampaignRecipient.findOneAndUpdate(
                { campaignId, email: recipientEmail },
                {
                    status: 'sent',
                    sentAt: new Date(),
                    html: html // Optional: save snapshot
                },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({ message: 'Email sent successfully', messageId: info.messageId });

    } catch (error: any) {
        console.error("Email send error:", error);
        // Log failure if campaignId exists
        const { campaignId, recipientEmail } = await req.json().catch(() => ({}));
        if (campaignId && recipientEmail) {
            await CampaignRecipient.findOneAndUpdate(
                { campaignId, email: recipientEmail },
                {
                    status: 'failed',
                    failedReason: error.message,
                },
                { upsert: true }
            );
        }

        return NextResponse.json(
            { message: 'Failed to send email', error: error.message },
            { status: 500 }
        );
    }
}
