import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For free hosting, we also return base64 as fallback
    // But try to save to filesystem for local dev
    const fileName = `${crypto.randomBytes(8).toString("hex")}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;
    return NextResponse.json({ url, fileName, size: file.size });
  } catch (e) {
    console.error(e);
    // Fallback: return base64 data url if fs fails (for read-only envs)
    try {
      const formData = await req.clone().formData().catch(() => null);
      // On error we can't redo, so just return error
      return NextResponse.json({ error: "Upload failed, use external URL" }, { status: 500 });
    } catch {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  }
}
