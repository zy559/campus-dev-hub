import { cookies } from "next/headers";
import BrowseOrFeed from "@/components/layout/BrowseOrFeed";

export const revalidate = 30;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { tag?: string; browse?: string; search?: string };
}) {
  const hasSessionCookie = Boolean(
    cookies().get("next-auth.session-token") ||
      cookies().get("__Secure-next-auth.session-token")
  );
  const session = hasSessionCookie
    ? await import("next-auth").then(async ({ getServerSession }) => {
        const { authOptions } = await import("@/lib/auth");
        return getServerSession(authOptions);
      })
    : null;
  const isLoggedIn = !!session?.user?.id;
  const viewer = session?.user
    ? { id: session.user.id, role: session.user.role || "user" }
    : undefined;
  const isBrowsing = searchParams.browse === "1";
  const tag = searchParams.tag;
  const search = searchParams.search || "";

  return (
    <BrowseOrFeed
      session={isLoggedIn}
      isBrowsing={isBrowsing}
      tag={tag}
      search={search}
      viewer={viewer}
    />
  );
}
