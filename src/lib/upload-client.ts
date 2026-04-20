"use client";

import toast from "react-hot-toast";

/**
 * Client-side helper: POST a File to /api/upload and return the stored URL.
 *
 * Throws on any HTTP error (non-2xx, network failure, invalid JSON) so
 * callers can show a toast / abort the save. The previous code silently
 * swallowed errors, which is why uploads "appeared to work but the image
 * never showed up" — the URL was `undefined`.
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: formData });
  } catch (e) {
    throw new Error(`Network error during upload: ${(e as Error).message}`);
  }

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore non-JSON response
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("Upload succeeded but no URL was returned");
  return data.url;
}

/**
 * Same as uploadFile, but shows a toast on failure and returns null
 * instead of throwing — convenient for input onChange handlers.
 */
export async function uploadFileWithToast(file: File): Promise<string | null> {
  try {
    return await uploadFile(file);
  } catch (e) {
    toast.error((e as Error).message || "Upload failed");
    return null;
  }
}
