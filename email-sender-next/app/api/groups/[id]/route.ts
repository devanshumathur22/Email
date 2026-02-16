
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Group from "@/models/Group";

export async function DELETE(
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

        const result = await Group.findOneAndDelete({ _id: id, userId: decoded.id });
        if (!result) {
            return NextResponse.json({ message: "Group not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Deleted" });
    } catch (error: any) {
        return NextResponse.json(
            { message: "Delete failed", error: error.message },
            { status: 500 }
        );
    }
}

export async function PATCH(
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

        const { name } = await req.json();

        const group = await Group.findOneAndUpdate(
            { _id: id, userId: decoded.id },
            { name },
            { new: true }
        );

        if (!group) {
            return NextResponse.json({ message: "Group not found" }, { status: 404 });
        }

        return NextResponse.json(group);
    } catch (error: any) {
        return NextResponse.json(
            { message: "Update failed", error: error.message },
            { status: 500 }
        );
    }
}
