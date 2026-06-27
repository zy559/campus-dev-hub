import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MeClient from "./MeClient";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <MeClient
      user={{
        name: session.user.name || "我",
        email: session.user.email || "",
        role: session.user.role || "user",
        impersonating: Boolean(session.user.impersonating),
      }}
    />
  );
}
