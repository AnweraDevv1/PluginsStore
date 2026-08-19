import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { extractToken, verifyToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

type ImportProject = {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  category?: string;
  version?: string;
  minecraftVersion?: string;
  downloadUrl: string;
  githubUrl?: string | null;
  modrinthUrl?: string | null;
  curseforgeUrl?: string | null;
  banner?: string | null;
  videoUrl?: string | null;
  dependencies?: number[];
  screenshots?: string[];
  tags?: string[];
  features?: string[];
  fileSize?: string;
  featured?: boolean;
  status?: string;
  downloads?: number;
  _originalId?: number;
};

/**
 * POST /api/projects/import
 * Импортирует проекты из JSON экспорта.
 * Требует авторизацию.
 * 
 * Body: 
 *  - JSON объект: { projects: ImportProject[], mode?: "create" | "upsert" }
 *  - или массив ImportProject[]
 *  - или FormData с полем file (JSON файл)
 * 
 * mode:
 *   "create" (default) — всегда создаёт новые проекты, если slug занят — генерирует новый
 *   "upsert" — если slug уже существует — обновляет существующий проект
 */
export async function POST(req: NextRequest) {
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: any = null;
    let mode: "create" | "upsert" = "create";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      const file = fd.get("file") as File | null;
      const modeField = fd.get("mode") as string | null;
      if (modeField === "upsert") mode = "upsert";
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
      const text = await file.text();
      body = JSON.parse(text);
      // если в FormData есть отдельный projects JSON
      if (fd.get("projects")) {
        try { body = JSON.parse(fd.get("projects") as string); } catch {}
      }
    } else {
      // JSON body
      body = await req.json();
      if (body.mode === "upsert") mode = "upsert";
    }

    // Нормализуем вход: массив или объект с projects / project (одиночный файл)
    let toImport: ImportProject[] = [];
    if (Array.isArray(body)) {
      toImport = body;
    } else if (Array.isArray(body.projects)) {
      toImport = body.projects;
      if (body.mode === "upsert") mode = "upsert";
    } else if (body.project && typeof body.project === "object" && body.project.title) {
      // формат одиночного экспорта: { project: {...} }
      toImport = [body.project];
      if (body.mode === "upsert") mode = "upsert";
    } else if (body.title && (body.slug || body.shortDescription)) {
      // одиночный проект объект напрямую
      toImport = [body];
    } else {
      return NextResponse.json({ error: "Invalid format: expected { projects: [...] } or { project: {...} } or [...] or single project" }, { status: 400 });
    }

    if (toImport.length === 0) {
      return NextResponse.json({ error: "Empty import list" }, { status: 400 });
    }
    if (toImport.length > 100) {
      return NextResponse.json({ error: "Too many projects (max 100 per import)" }, { status: 400 });
    }

    // Загружаем существующие слаги для проверки коллизий
    const existing: any[] = await db.select().from(projects);
    const slugToId = new Map<string, number>(existing.map((p: any) => [p.slug, p.id] as [string, number]));
    const existingSlugs = new Set<string>(existing.map((p: any) => p.slug));
    const idSet = new Set<number>(existing.map((p: any) => p.id));

    // Для маппинга зависимостей: oldId -> newId
    const oldIdToNewId = new Map<number, number>();

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];
    const results: any[] = [];

    // Первый проход: создаём/обновляем без зависимостей
    for (let idx = 0; idx < toImport.length; idx++) {
      const p = toImport[idx];
      // Валидация минимальных полей
      if (!p.title || !p.shortDescription || !p.description || !p.downloadUrl) {
        errors.push(`[${idx}] ${p.title || "без названия"}: пропущен — нужны title, shortDescription, description, downloadUrl`);
        skipped++;
        continue;
      }

      // Нормализуем slug
      let slug = (p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim();
      if (!slug) slug = `project-${Date.now().toString(36)}-${idx}`;
      // Очищаем slug
      slug = slug.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/(^-|-$)/g, "") || `project-${idx}`;

      try {
        if (mode === "upsert" && existingSlugs.has(slug)) {
          // Update existing
          const existingId = slugToId.get(slug)!;
          const [upd] = await (db.update(projects) as any).set({
            title: p.title,
            slug,
            shortDescription: p.shortDescription,
            description: p.description,
            category: p.category || "plugin",
            version: p.version || "1.0.0",
            minecraftVersion: p.minecraftVersion || "1.20+",
            downloadUrl: p.downloadUrl,
            githubUrl: p.githubUrl || null,
            modrinthUrl: p.modrinthUrl || null,
            curseforgeUrl: p.curseforgeUrl || null,
            banner: p.banner || null,
            videoUrl: p.videoUrl || null,
            // dependencies обновим вторым проходом
            screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
            tags: Array.isArray(p.tags) ? p.tags : [],
            features: Array.isArray(p.features) ? p.features : [],
            fileSize: p.fileSize || "~2.5 MB",
            featured: !!p.featured,
            status: p.status === "draft" ? "draft" : "published",
            updatedAt: new Date(),
          }).where(eq(projects.id as any, existingId as any)).returning();
          if (p._originalId) oldIdToNewId.set(p._originalId, existingId);
          // также маппим по порядку в файле (индекс+1) если нейросеть не сохранила _originalId
          oldIdToNewId.set(idx + 1, existingId);
          updated++;
          results.push(upd);
        } else {
          // Create new — если slug занят, генерируем уникальный
          let finalSlug = slug;
          if (existingSlugs.has(finalSlug)) {
            let suffix = 1;
            while (existingSlugs.has(`${slug}-${suffix}`)) suffix++;
            finalSlug = `${slug}-${suffix}`;
            // ещё гарантия уникальности по времени если много импортов
            if (existingSlugs.has(finalSlug)) finalSlug = `${slug}-${Date.now().toString(36)}-${idx}`;
          }
          const [created] = await (db.insert(projects) as any).values({
            title: p.title,
            slug: finalSlug,
            shortDescription: p.shortDescription,
            description: p.description,
            category: p.category || "plugin",
            version: p.version || "1.0.0",
            minecraftVersion: p.minecraftVersion || "1.20+",
            downloadUrl: p.downloadUrl,
            githubUrl: p.githubUrl || null,
            modrinthUrl: p.modrinthUrl || null,
            curseforgeUrl: p.curseforgeUrl || null,
            banner: p.banner || null,
            videoUrl: p.videoUrl || null,
            dependencies: [], // пока пусто
            screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
            tags: Array.isArray(p.tags) ? p.tags : [],
            features: Array.isArray(p.features) ? p.features : [],
            fileSize: p.fileSize || "~2.5 MB",
            featured: !!p.featured,
            status: p.status === "draft" ? "draft" : "published",
            downloads: typeof p.downloads === "number" ? p.downloads : 0,
          }).returning();
          existingSlugs.add(finalSlug);
          slugToId.set(finalSlug, created.id);
          if (p._originalId) oldIdToNewId.set(p._originalId, created.id);
          oldIdToNewId.set(idx + 1, created.id);
          // также маппим старый ID если был в файле порядку
          // если в файле были _originalId, они уже замаплены
          imported++;
          results.push(created);
        }
      } catch (e: any) {
        console.error("Import item failed", e);
        errors.push(`[${idx}] ${p.title}: ${e.message}`);
        skipped++;
      }
    }

    // Второй проход: обновляем dependencies с учётом маппинга
    // Нужно обновить dependencies для вновь созданных/обновлённых
    for (let idx = 0; idx < toImport.length; idx++) {
      const p = toImport[idx];
      if (!p.dependencies || !Array.isArray(p.dependencies) || p.dependencies.length === 0) continue;
      // Найдём созданный проект (по порядку или по _originalId)
      const newId = p._originalId ? oldIdToNewId.get(p._originalId) : oldIdToNewId.get(idx + 1);
      if (!newId) continue;
      const mappedDeps = p.dependencies.map((oldDepId: number) => {
        // Если oldDepId есть в маппинге — заменяем, иначе если такой ID уже есть в БД — оставляем, иначе дропаем
        if (oldIdToNewId.has(oldDepId)) return oldIdToNewId.get(oldDepId)!;
        if (idSet.has(oldDepId)) return oldDepId;
        // пробуем найти по последнему маппингу (например 1,2,3 из файла)
        return null;
      }).filter((v: any) => v !== null) as number[];

      if (mappedDeps.length > 0) {
        try {
          await (db.update(projects) as any).set({ dependencies: mappedDeps, updatedAt: new Date() }).where(eq(projects.id as any, newId as any));
          // обновим в results для ответа
          const r = results.find((x: any) => x.id === newId);
          if (r) r.dependencies = mappedDeps;
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      updated,
      skipped,
      total: toImport.length,
      mode,
      errors: errors.length ? errors : undefined,
      projects: results,
    });
  } catch (e: any) {
    console.error("Import failed", e);
    return NextResponse.json({ error: e.message || "Failed to import" }, { status: 500 });
  }
}
