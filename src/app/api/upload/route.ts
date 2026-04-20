import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getUploadDir, getPublicUrlFor } from "@/lib/uploads";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size === 0) {
      return Response.json({ error: "Empty file" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: `File too large. Max ${MAX_BYTES / (1024 * 1024)}MB` },
        { status: 413 }
      );
    }

    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Keep extension but sanitize — no path separators.
    const rawExt = path.extname(file.name || "").toLowerCase();
    const ext = /^\.[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : ".png";
    const fileName = `${uuidv4()}${ext}`;

    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    return Response.json({ url: getPublicUrlFor(fileName) });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
