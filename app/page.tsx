import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BrowseOrFeed from "@/components/layout/BrowseOrFeed";

export const revalidate = 30;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { tag?: string; browse?: string; search?: string };
}) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;
  const isBrowsing = searchParams.browse === "1";
  const tag = searchParams.tag;
  const search = searchParams.search || "";

  return (
    <BrowseOrFeed
      session={isLoggedIn}
      isBrowsing={isBrowsing}
      tag={tag}
      search={search}
    />
  );
}
