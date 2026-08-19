import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, type Project } from "@/db/schema";
import { extractToken, verifyToken } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Админ может запросить все проекты (включая черновики) через ?all=true
    const wantAll = req.nextUrl.searchParams.get("all") === "true";
    if (wantAll) {
      const token = extractToken(req);
      if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const rows: Project[] = await db.select().from(projects).orderBy(desc(projects.createdAt));
    // Посетителям показываем только опубликованные
    const allProjects = wantAll ? rows : rows.filter(p => p.status === "published");
    return NextResponse.json(allProjects);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);

    const [newProject] = await db.insert(projects).values({
      title: body.title,
      slug,
      shortDescription: body.shortDescription,
      description: body.description,
      category: body.category || "plugin",
      version: body.version || "1.0.0",
      minecraftVersion: body.minecraftVersion || "1.20+",
      downloadUrl: body.downloadUrl,
      githubUrl: body.githubUrl || null,
      modrinthUrl: body.modrinthUrl || null,
      curseforgeUrl: body.curseforgeUrl || null,
      banner: body.banner || null,
      videoUrl: body.videoUrl || null,
      dependencies: Array.isArray(body.dependencies) ? body.dependencies.map((n:any)=>parseInt(n)).filter((n:any)=>!isNaN(n)) : [],
      screenshots: body.screenshots || [],
      tags: body.tags || [],
      features: body.features || [],
      fileSize: body.fileSize || "~2.5 MB",
      featured: body.featured || false,
      status: body.status || "published",
    }).returning();

    return NextResponse.json(newProject);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
