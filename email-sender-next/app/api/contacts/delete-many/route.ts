
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Verify token
        const token = authHeader.split(" ")[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const { ids } = await req.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ message: "No ids provided" }, { status: 400 });
        }

        // Only delete contacts belonging to user
        const result = await Contact.deleteMany({
            _id: { $in: ids },
            userId: decoded.id
        });

        return NextResponse.json({ message: "Deleted", count: result.deletedCount });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Delete failed", error: error.message },
            { status: 500 }
        );
    }
}
