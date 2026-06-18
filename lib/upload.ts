import { put } from "@vercel/blob";

export async function uploadToBlob(file: File): Promise<string> {
  const blob = await put(file.name, file, {
    addRandomSuffix: true,
  });
  return blob.url;
}
