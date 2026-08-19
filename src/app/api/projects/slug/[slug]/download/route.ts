import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { driveDownloadUrl } from "@/lib/media";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    if (!project || !project.downloadUrl) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Считаем скачивание
    await db.update(projects)
      .set({ downloads: (project.downloads || 0) + 1 })
      .where(eq(projects.slug, slug))
      .catch(()=>{});

    let url = project.downloadUrl;

    // Файл, загруженный на сервер (/uploads/...)
    if (url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
      if (existsSync(filePath)) {
        const data = await readFile(filePath);
        const filename = path.basename(url);
        return new NextResponse(data, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }
      // Файла нет — просто ведём на статику
      return NextResponse.redirect(new URL(url, req.url));
    }

    // Google Drive -> прямая ссылка на скачивание
    url = driveDownloadUrl(url);

    // Внешняя ссылка -> редирект (браузер сам начнёт скачивание)
    return NextResponse.redirect(url);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
