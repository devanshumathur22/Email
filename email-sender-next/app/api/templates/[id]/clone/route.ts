
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Template from "@/models/Template";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const token = authHeader.split(" ")[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const original = await Template.findOne({ _id: id, userId: decoded.id });
        if (!original) {
            return NextResponse.json({ message: "Template not found" }, { status: 404 });
        }

        const clone = await Template.create({
            userId: decoded.id,
            name: `${original.name} (Copy)`,
            subject: original.subject,
            html: original.html,
            category: original.category,
            isFavorite: false,
        });

        return NextResponse.json(clone, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Clone failed", error: error.message },
            { status: 500 }
        );
    }
}
