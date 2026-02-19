
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import csvParser from "csv-parser";
import { Readable } from "stream";

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

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "File required" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const results: any[] = [];

        await new Promise((resolve, reject) => {
            stream.pipe(csvParser())
                .on("data", (data) => results.push(data))
                .on("end", resolve)
                .on("error", reject);
        });

        if (results.length === 0) {
            return NextResponse.json({ message: "Empty CSV" }, { status: 400 });
        }

        const operations = results.map(row => ({
            userId: decoded.id,
            email: row.email || row.Email,
            name: row.name || row.Name || "",
            // Add other fields? Groups?
        })).filter(val => val.email);

        // Using bulkWrite for efficiency and handling duplicates via "upsert" or trying `insertMany` with `ordered: false` to skip duplicates
        // But uniqueness constraint on email+userId is key.

        // Simple approach: batch promises
        let successCount = 0;

        // Using bulkWrite with updateOne upsert to avoid duplicate errors and update existing
        const bulkOps = operations.map(op => ({
            updateOne: {
                filter: { email: op.email, userId: op.userId },
                update: { $set: op },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) {
            await Contact.bulkWrite(bulkOps);
            successCount = bulkOps.length;
        }

        return NextResponse.json({ message: `Imported ${successCount} contacts` });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { message: "Upload failed", error: error.message },
            { status: 500 }
        );
    }
}
