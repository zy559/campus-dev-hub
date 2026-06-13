import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const boards = await db.board.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(boards);
  } catch (error) {
    console.error("Get boards error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
