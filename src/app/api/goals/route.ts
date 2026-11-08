import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { savingGoals } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!db) return NextResponse.json({ items: [] });
  try {
    const rows = await db.select().from(savingGoals);
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
    const [row] = await db
      .insert(savingGoals)
      .values({
        title: body.title,
        targetAmount: String(body.targetAmount),
        currentAmount: String(body.currentAmount || 0),
        monthlyDeposit: String(body.monthlyDeposit || 0),
      })
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!db) return NextResponse.json({ error: "No DB" }, { status: 503 });
  try {
    const body = await req.json();
    const [row] = await db
      .update(savingGoals)
      .set({
        title: body.title,
        targetAmount: String(body.targetAmount),
        currentAmount: String(body.currentAmount),
        monthlyDeposit: String(body.monthlyDeposit),
      })
      .where(eq(savingGoals.id, body.id))
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
