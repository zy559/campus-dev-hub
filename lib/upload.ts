import { put } from "@vercel/blob";

export async function uploadToBlob(file: File): Promise<string> {
  const blob = await put(file.name, file, {
    access: "private",
    addRandomSuffix: true,
  });
  // Private blob URLs include an embedded token — directly accessible in <img> tags
  console.log("[upload] blob URL:", blob.url.slice(0, 80) + "...");
  return blob.url;
}
