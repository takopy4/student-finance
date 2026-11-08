import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { budgetLimits } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!db) return NextResponse.json({ items: [] });
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
  try {
    const rows = await db.select().from(budgetLimits).where(eq(budgetLimits.month, month));
    return NextResponse.json({ items: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: Request) {
  if (!db) return NextResponse.json({ error: "No DB" }, { status: 503 });
  try {
    const body = await req.json();
    // Upsert: delete old then insert
    await db
      .delete(budgetLimits)
      .where(
        and(eq(budgetLimits.category, body.category), eq(budgetLimits.month, body.month))
      );
    const [row] = await db
      .insert(budgetLimits)
      .values({
        category: body.category,
        limitAmount: String(body.limitAmount),
        month: body.month,
      })
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
