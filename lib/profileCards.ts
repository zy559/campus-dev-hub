import { PROFILE_CARD_MARKER } from "@/lib/activitySections";
import { parsePostMedia } from "@/lib/postMedia";

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

function splitTextList(value: string) {
  return value
    .split(/[、,，\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function parseLegacyProfileCard(post: ProfileCardPost, rawPayload: string): ProfileCard | null {
  const media = parsePostMedia(rawPayload);
  const lines = media.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const readField = (names: string[]) => {
    const line = lines.find((item) => names.some((name) => item.startsWith(`${name}：`) || item.startsWith(`${name}:`)));
    if (!line) return "";
    const index = Math.max(line.indexOf("："), line.indexOf(":"));
    return index >= 0 ? line.slice(index + 1).trim() : "";
  };

  const name = readField(["昵称", "name"]) || post.author.username;
  const meta = readField(["学校", "meta"]) || "Campus student";
  const needs = splitTextList(readField(["想找", "needs"]));
  const interests = splitTextList(readField(["兴趣", "interests"]));
  const intro = lines
    .filter((line) => !["昵称", "name", "学校", "meta", "想找", "needs", "兴趣", "interests"].some((name) => line.startsWith(`${name}：`) || line.startsWith(`${name}:`)))
    .join("\n")
    .trim();

  if (!name || !intro) return null;

  return {
    id: post.id,
    postId: post.id,
    remote: true,
    name,
    meta,
    intro,
    needs,
    interests,
    cover: media.images[0] || "",
    signal: "Online",
    imageTone: "teal",
    createdAt: post.createdAt.toISOString(),
    author: post.author,
  };
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
    return parseLegacyProfileCard(post, rawPayload);
  }
}
