import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const userCount = await db.user.count();
    const users = await db.user.findMany({ select: { id: true, username: true, email: true }, take: 10 });
    return NextResponse.json({ userCount, users, dbConnected: true });
  } catch (e: unknown) {
    const error = e as Error;
    return NextResponse.json({ dbConnected: false, error: error.message });
  }
}
