import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, Connect } from "vite";

const execFileAsync = promisify(execFile);

type ManifestItem = { type: "photo"; src: string };

const PROJECTS_DIR = path.resolve("public/projects");
const MANIFEST_PATH = path.join(PROJECTS_DIR, "manifest.json");

const BLOCKED_STEMS = new Set([
  "work-collage",
  "work-collage-home",
  "job-clip-poster",
  "readme",
  "manifest",
  "logo",
  "logo-plate",
  "logo-mark",
  "favicon",
]);

function readManifest(): ManifestItem[] {
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw) as ManifestItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeManifest(items: ManifestItem[]) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
  const seen = new Set<string>();
  const deduped: ManifestItem[] = [];
  for (const item of items) {
    const key = item.src.toLowerCase();
    const stem = path.basename(item.src).replace(/\.[^.]+$/, "").toLowerCase();
    if (seen.has(key) || seen.has(`stem:${stem}`) || BLOCKED_STEMS.has(stem)) continue;
    seen.add(key);
    seen.add(`stem:${stem}`);
    deduped.push(item);
  }
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(deduped, null, 2)}\n`, "utf8");
}

function safeBaseName(name: string): string {
  const base = path
    .basename(name)
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "project-photo";
}

function uniqueJpgName(original: string): string {
  const base = safeBaseName(original);
  let candidate = `${base}.jpg`;
  let i = 2;
  while (fs.existsSync(path.join(PROJECTS_DIR, candidate))) {
    candidate = `${base}-${i}.jpg`;
    i += 1;
  }
  return candidate;
}

function findExistingByHash(body: Buffer): string | null {
  const incoming = crypto.createHash("sha256").update(body).digest("hex");
  if (!fs.existsSync(PROJECTS_DIR)) return null;
  for (const name of fs.readdirSync(PROJECTS_DIR)) {
    if (!/\.(jpe?g|png|webp)$/i.test(name)) continue;
    const full = path.join(PROJECTS_DIR, name);
    try {
      const existing = crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
      if (existing === incoming) return name;
    } catch {
      // skip unreadable
    }
  }
  return null;
}

function readRequestBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function gitPublish(message: string) {
  await execFileAsync("git", ["add", "public/projects"]);
  try {
    await execFileAsync("git", ["diff", "--cached", "--quiet"]);
    return { committed: false, pushed: false };
  } catch {
    // non-zero means there are staged changes
  }
  await execFileAsync("git", ["commit", "-m", message]);
  await execFileAsync("git", ["push", "-u", "origin", "HEAD"]);
  return { committed: true, pushed: true };
}

function attachUploadApi(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = new URL(req.url || "/", "http://localhost");

    if (url.pathname === "/api/project-photos" && req.method === "POST") {
      try {
        const suggested = url.searchParams.get("name") || "project-photo.jpg";
        const body = await readRequestBody(req);
        if (!body.length) {
          sendJson(res, 400, { ok: false, error: "Empty file" });
          return;
        }
        if (body.length > 25 * 1024 * 1024) {
          sendJson(res, 400, { ok: false, error: "File too large (max 25MB)" });
          return;
        }

        fs.mkdirSync(PROJECTS_DIR, { recursive: true });

        const duplicateName = findExistingByHash(body);
        const filename = duplicateName || uniqueJpgName(suggested);
        if (!duplicateName) {
          fs.writeFileSync(path.join(PROJECTS_DIR, filename), body);
        }

        const src = `/projects/${filename}`;
        const manifest = readManifest().filter(
          (item) => item.src.toLowerCase() !== src.toLowerCase(),
        );
        manifest.unshift({ type: "photo", src });
        writeManifest(manifest);

        sendJson(res, 200, {
          ok: true,
          src,
          filename,
          duplicate: Boolean(duplicateName),
          count: manifest.length,
        });
      } catch (err) {
        sendJson(res, 500, {
          ok: false,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
      return;
    }

    if (url.pathname === "/api/project-photos/publish" && req.method === "POST") {
      try {
        const result = await gitPublish("Add project photos from dump bucket");
        sendJson(res, 200, { ok: true, ...result, count: readManifest().length });
      } catch (err) {
        sendJson(res, 500, {
          ok: false,
          error: err instanceof Error ? err.message : "Publish failed",
        });
      }
      return;
    }

    if (url.pathname === "/api/project-photos" && req.method === "GET") {
      sendJson(res, 200, { ok: true, items: readManifest() });
      return;
    }

    next();
  };
}

/** Dev/preview API: dump JPGs into public/projects + manifest, optional git publish. */
export function projectPhotoBucketPlugin(): Plugin {
  return {
    name: "project-photo-bucket",
    configureServer(server) {
      server.middlewares.use(attachUploadApi());
    },
    configurePreviewServer(server) {
      server.middlewares.use(attachUploadApi());
    },
  };
}
