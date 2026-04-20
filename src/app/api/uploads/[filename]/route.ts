import { NextRequest } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { getUploadDir, isSafeUploadName } from "@/lib/uploads";

// Force Node runtime — Edge can't read from arbitrary filesystem paths.
export const runtime = "nodejs";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: raw } = await params;
  const filename = decodeURIComponent(raw);

  if (!isSafeUploadName(filename)) {
    return new Response("Bad filename", { status: 400 });
  }

  const uploadDir = getUploadDir();
  const filePath = path.join(uploadDir, filename);

  // Defence in depth: ensure the resolved path is still inside uploadDir.
  const resolved = path.resolve(filePath);
  const resolvedDir = path.resolve(uploadDir);
  if (!resolved.startsWith(resolvedDir + path.sep) && resolved !== resolvedDir) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const info = await stat(resolved);
    if (!info.isFile()) return new Response("Not found", { status: 404 });

    const body = await readFile(resolved);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";

    return new Response(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": info.size.toString(),
        // Upload filenames are UUIDs — safe to cache aggressively.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
