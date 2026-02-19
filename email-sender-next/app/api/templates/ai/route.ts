
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Verify token if needed

        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ message: "Prompt required" }, { status: 400 });
        }

        // Mock AI generation
        const responseData = {
            subject: `[AI] ${prompt.slice(0, 20)}...`,
            html: `
        <div style="font-family: sans-serif; padding: 20px;">
            <h1>Thanks for your interest in ${prompt}</h1>
            <p>We have a special offer for you.</p>
            <button style="background: blue; color: white; padding: 10px 20px;">Shop Now</button>
        </div>
        `,
            category: "promo"
        };

        // Simulate delay
        await new Promise(r => setTimeout(r, 1500));

        return NextResponse.json(responseData);

    } catch (error: any) {
        return NextResponse.json(
            { message: "AI Request failed", error: error.message },
            { status: 500 }
        );
    }
}
