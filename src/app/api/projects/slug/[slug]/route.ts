import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
import { extractToken, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Резолвим зависимости: достаём инфу по всем ID из dependencies
    if (Array.isArray(project.dependencies) && project.dependencies.length > 0) {
      const deps = await db.select().from(projects).where(inArray(projects.id, project.dependencies));
      (project as any).dependencyDetails = deps.map((d: typeof projects.$inferSelect) => ({
        id: d.id, slug: d.slug, title: d.title, version: d.version, fileSize: d.fileSize, downloadUrl: d.downloadUrl,
      }));
    } else {
      (project as any).dependencyDetails = [];
    }
    // Черновики доступны только админу
    if (project.status !== "published") {
      const token = extractToken(req);
      if (!token || !verifyToken(token)) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    }
    return NextResponse.json(project);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // increment downloads
  const { slug } = await params;
  try {
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const [updated] = await db.update(projects)
      .set({ downloads: (project.downloads || 0) + 1 })
      .where(eq(projects.slug, slug))
      .returning();
    
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
