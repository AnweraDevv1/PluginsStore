import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { extractToken, verifyToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, idNum));
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await req.json();
    const [updated] = await db.update(projects).set({
      title: body.title,
      slug: body.slug,
      shortDescription: body.shortDescription,
      description: body.description,
      category: body.category,
      version: body.version,
      minecraftVersion: body.minecraftVersion,
      downloadUrl: body.downloadUrl,
      githubUrl: body.githubUrl || null,
      modrinthUrl: body.modrinthUrl || null,
      curseforgeUrl: body.curseforgeUrl || null,
      banner: body.banner || null,
      videoUrl: body.videoUrl || null,
      dependencies: Array.isArray(body.dependencies) ? body.dependencies.map((n:any)=>parseInt(n)).filter((n:any)=>!isNaN(n)) : [],
      screenshots: body.screenshots,
      tags: body.tags,
      features: body.features,
      fileSize: body.fileSize,
      featured: body.featured,
      status: body.status,
      updatedAt: new Date(),
    }).where(eq(projects.id, idNum)).returning();

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const idNum = parseInt(id);
  if (isNaN(idNum)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await db.delete(projects).where(eq(projects.id, idNum));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
