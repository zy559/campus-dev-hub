import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { path } = await request.json();
    if (path) {
      revalidatePath(path);
    }
    // always revalidate the homepage
    revalidatePath("/");

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
