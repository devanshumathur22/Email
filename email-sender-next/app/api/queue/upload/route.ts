
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/db";
import EmailQueue from "@/models/EmailQueue";
import csvParser from "csv-parser";
import { Readable } from "stream";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode") || "append";

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

        // Convert file to buffer and stream
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = Readable.from(buffer);

        const results: any[] = [];

        await new Promise((resolve, reject) => {
            stream
                .pipe(csvParser())
                .on("data", (data) => results.push(data))
                .on("end", resolve)
                .on("error", reject);
        });

        if (results.length === 0) {
            return NextResponse.json({ message: "Empty CSV" }, { status: 400 });
        }

        // Validate and format
        const newItems = results.map(row => ({
            userId: decoded.id,
            email: row.email || row.Email,
            subject: row.subject || row.Subject || "(No Subject)",
            html: row.html || row.Body || row.body || "",
            status: "queued"
        })).filter(item => item.email); // filter out empty rows

        if (mode === "replace") {
            await EmailQueue.deleteMany({ userId: decoded.id, status: "queued" });
        }

        if (newItems.length > 0) {
            await EmailQueue.insertMany(newItems);
        }

        return NextResponse.json({ message: `Imported ${newItems.length} items` });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { message: "Upload failed", error: error.message },
            { status: 500 }
        );
    }
}
