
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const token = authHeader.split(" ")[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const { id } = params;

        const result = await Contact.findOneAndDelete({
            _id: id,
            userId: decoded.id
        });

        if (!result) {
            return NextResponse.json({ message: "Contact not found" }, { status: 404 });
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
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const token = authHeader.split(" ")[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const { id } = params;
        const updateData = await req.json();

        const contact = await Contact.findOneAndUpdate(
            { _id: id, userId: decoded.id },
            updateData,
            { new: true }
        );

        if (!contact) {
            return NextResponse.json({ message: "Contact not found" }, { status: 404 });
        }

        return NextResponse.json(contact);
    } catch (error: any) {
        return NextResponse.json(
            { message: "Update failed", error: error.message },
            { status: 500 }
        );
    }
}
