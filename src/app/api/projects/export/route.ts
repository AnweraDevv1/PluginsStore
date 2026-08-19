import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { extractToken, verifyToken } from "@/lib/auth";
import { desc } from "drizzle-orm";

/**
 * GET /api/projects/export
 * Экспортирует все проекты в JSON файл для импорта/бэкапа.
 * Формат совместим с /api/projects/import
 * Требует авторизацию (админ).
 * 
 * Query params:
 *   ?ids=1,2,3 — экспортировать только указанные ID (опционально)
 *   ?slugs=slug1,slug2 — экспортировать только указанные slug
 */
export async function GET(req: NextRequest) {
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const idsParam = searchParams.get("ids");
    const slugsParam = searchParams.get("slugs");

    let rows: any[] = await db.select().from(projects).orderBy(desc(projects.createdAt));

    // Фильтр по ids/slugs если указан
    if (idsParam) {
      const ids = idsParam.split(",").map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
      if (ids.length > 0) rows = rows.filter((r: any) => ids.includes(r.id));
    }
    if (slugsParam) {
      const slugs = slugsParam.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (slugs.length > 0) rows = rows.filter((r: any) => slugs.includes(r.slug));
    }

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      count: rows.length,
      // Инструкция для нейросети / человека
      _hint: "Это экспорт проектов AnweraDev PluginsStore. Отдай этот JSON нейросети чтобы она изучила/изменила проекты, затем импортируй обратно через админку (Импорт).",
      projects: rows.map((p: any) => ({
        // Основные поля
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        category: p.category,
        version: p.version,
        minecraftVersion: p.minecraftVersion,
        downloadUrl: p.downloadUrl,
        githubUrl: p.githubUrl,
        modrinthUrl: p.modrinthUrl,
        curseforgeUrl: p.curseforgeUrl,
        banner: p.banner,
        videoUrl: p.videoUrl,
        dependencies: p.dependencies || [],
        screenshots: p.screenshots || [],
        tags: p.tags || [],
        features: p.features || [],
        fileSize: p.fileSize,
        featured: p.featured,
        status: p.status,
        downloads: p.downloads,
        // Служебные для маппинга зависимостей при импорте
        _originalId: p.id,
      })),
    };

    // Отдаём как скачиваемый JSON
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"anweradev-export-${new Date().toISOString().slice(0, 10)}-${payload.count}-projects.json\"`,
      },
    });
  } catch (e) {
    console.error("Export failed", e);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
