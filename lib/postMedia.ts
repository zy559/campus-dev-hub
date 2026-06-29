export const POST_IMAGES_MARKER = "[IMAGES]";

const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;

export function buildPostContentWithImages(text: string, images: string[]) {
  const cleanText = text.trim();
  const cleanImages = images.map((url) => url.trim()).filter(Boolean);
  if (!cleanImages.length) return cleanText;
  return `${cleanText}\n\n${POST_IMAGES_MARKER}\n${JSON.stringify(cleanImages)}`;
}

export function parsePostMedia(content: string) {
  const value = String(content || "");
  const markerIndex = value.indexOf(POST_IMAGES_MARKER);

  if (markerIndex !== -1) {
    const text = value.slice(0, markerIndex).trim();
    const rawImages = value.slice(markerIndex + POST_IMAGES_MARKER.length).trim();
    try {
      const parsed = JSON.parse(rawImages);
      return {
        text,
        images: Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [],
      };
    } catch {
      return { text, images: [] };
    }
  }

  const images = Array.from(value.matchAll(MARKDOWN_IMAGE_RE), (match) => match[1]).filter(Boolean);
  const text = value
    .replace(MARKDOWN_IMAGE_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { text, images };
}

export function toMarkdownContent(content: string) {
  const media = parsePostMedia(content);
  if (!media.images.length) return media.text;

  const imageMarkdown = media.images.map((url, index) => `![图片${index + 1}](${url})`).join("\n\n");
  return [media.text, imageMarkdown].filter(Boolean).join("\n\n");
}
