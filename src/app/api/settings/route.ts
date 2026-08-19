import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings as settingsTable } from "@/db/schema";
import { extractToken, verifyToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

const DEFAULT_SETTINGS = { id: 1, codeAnimation: true, data: {} };

export async function GET() {
  try {
    const [row] = await db.select().from(settingsTable).limit(1);
    if (!row) {
      const [created] = await db.insert(settingsTable).values({ id: 1 }).returning();
      return NextResponse.json(created);
    }
    return NextResponse.json(row);
  } catch (e) {
    // если таблицы нет — отдаём дефолт, чтобы сайт не падал
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(req: NextRequest) {
  const token = extractToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const codeAnimation = typeof body.codeAnimation === "boolean" ? body.codeAnimation : true;
    const data = body.data && typeof body.data === "object" ? body.data : {};
    const [updated] = await db.update(settingsTable)
      .set({ codeAnimation, data })
      .where(eq(settingsTable.id, 1))
      .returning();
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
