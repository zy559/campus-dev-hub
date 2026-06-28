import { PROFILE_CARD_MARKER } from "@/lib/activitySections";

export interface ProfileCardInput {
  name: string;
  meta?: string;
  intro: string;
  needs?: string[];
  interests?: string[];
  cover?: string;
}

export interface ProfileCardPost {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

export interface ProfileCard {
  id: string;
  postId: string;
  remote: true;
  name: string;
  meta: string;
  intro: string;
  needs: string[];
  interests: string[];
  cover: string;
  signal: string;
  imageTone: string;
  createdAt: string;
  author: ProfileCardPost["author"];
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(value.map((item) => String(item).trim()).filter(Boolean))
  ).slice(0, 6);
}

export function buildProfileCardContent(input: ProfileCardInput) {
  const payload = {
    name: input.name.trim(),
    meta: input.meta?.trim() || "Campus student",
    intro: input.intro.trim(),
    needs: cleanList(input.needs),
    interests: cleanList(input.interests),
    cover: input.cover?.trim() || "",
  };

  return `${PROFILE_CARD_MARKER}\n${JSON.stringify(payload)}`;
}

export function parseProfileCardPost(post: ProfileCardPost): ProfileCard | null {
  if (!post.content.startsWith(PROFILE_CARD_MARKER)) return null;

  const rawPayload = post.content.slice(PROFILE_CARD_MARKER.length).trim();
  if (!rawPayload) return null;

  try {
    const payload = JSON.parse(rawPayload) as Partial<ProfileCardInput>;
    const name = String(payload.name || "").trim();
    const intro = String(payload.intro || "").trim();
    if (!name || !intro) return null;

    return {
      id: post.id,
      postId: post.id,
      remote: true,
      name,
      meta: String(payload.meta || "Campus student").trim(),
      intro,
      needs: cleanList(payload.needs),
      interests: cleanList(payload.interests),
      cover: String(payload.cover || "").trim(),
      signal: "Online",
      imageTone: "teal",
      createdAt: post.createdAt.toISOString(),
      author: post.author,
    };
  } catch {
    return null;
  }
}
