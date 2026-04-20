import path from "path";

/**
 * Resolve the directory on disk where uploaded files are stored.
 *
 * In local dev we default to `public/uploads/` so Next.js' static file
 * handler serves them for free. In production (Docker/Dokploy) we point
 * UPLOAD_DIR at the persistent volume (e.g. `/app/data/uploads`) because
 * the container filesystem outside the volume is ephemeral — every
 * redeploy wipes `public/uploads`, which is why logo uploads were
 * "working locally but disappearing in production".
 */
export function getUploadDir(): string {
  const fromEnv = process.env.UPLOAD_DIR;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;
  return path.join(process.cwd(), "public", "uploads");
}

/**
 * Map a stored filename to the URL the browser should fetch.
 *
 * - When UPLOAD_DIR lives under `public/` (local dev default), the file
 *   is served statically at `/uploads/<file>`.
 * - When UPLOAD_DIR is outside `public/` (production), the file is
 *   streamed from disk through `/api/uploads/<file>`.
 */
export function getPublicUrlFor(fileName: string): string {
  const uploadDir = getUploadDir();
  const publicDir = path.join(process.cwd(), "public");
  if (uploadDir.startsWith(publicDir + path.sep) || uploadDir === publicDir) {
    const rel = path.relative(publicDir, path.join(uploadDir, fileName));
    return "/" + rel.split(path.sep).join("/");
  }
  return `/api/uploads/${encodeURIComponent(fileName)}`;
}

/**
 * Guard against path traversal when serving uploads.
 * Only accept bare filenames — no slashes, no `..`, no null bytes.
 */
export function isSafeUploadName(name: string): boolean {
  if (!name || name.length > 255) return false;
  if (name.includes("/") || name.includes("\\")) return false;
  if (name.includes("..") || name.includes("\0")) return false;
  return /^[A-Za-z0-9._-]+$/.test(name);
}
