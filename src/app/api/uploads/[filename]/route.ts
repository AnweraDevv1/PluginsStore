import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".jar": "application/java-archive",
  ".zip": "application/zip",
  ".txt": "text/plain",
  ".json": "application/json",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "audio/ogg",
};

/**
 * Динамическая отдача загруженных файлов.
 * Нужна потому, что `next start` отдаёт только файлы из /public,
 * которые существовали на момент сборки — новые загрузки 404.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  // защита от path traversal (../../etc/passwd)
  const safe = path.basename(filename);
  const filePath = path.join(process.cwd(), "public", "uploads", safe);

  if (!existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(safe).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    return new NextResponse("Error", { status: 500 });
  }
}
