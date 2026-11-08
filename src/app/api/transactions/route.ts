import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!db) return NextResponse.json({ items: [] });
  try {
    const rows = await db.select().from(transactions).orderBy(desc(transactions.date));
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
      .insert(transactions)
      .values({
        type: body.type,
        amount: String(body.amount),
        category: body.category,
        description: body.description || null,
        date: body.date ? new Date(body.date) : new Date(),
      })
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
