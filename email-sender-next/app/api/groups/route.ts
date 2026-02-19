
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";

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

        const groups = await Group.find({ userId: decoded.id }).populate("contacts");
        return NextResponse.json(groups);
    } catch (error: any) {
        return NextResponse.json(
            { message: "Fetch failed", error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
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

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ message: "Name required" }, { status: 400 });
        }

        const group = await Group.create({
            userId: decoded.id,
            name,
            contacts: [], // initially empty
        });

        return NextResponse.json(group, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Create failed", error: error.message },
            { status: 500 }
        );
    }
}
