import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heic2any from "heic2any";
import "./MediaConverter.css";

type QueueItem = {
  id: string;
  name: string;
  status: "queued" | "converting" | "uploading" | "done" | "error";
  src?: string;
  error?: string;
};

const HEIC_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

function isHeicFile(file: File): boolean {
  if (HEIC_TYPES.has(file.type.toLowerCase())) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

function jpgName(original: string): string {
  return original.replace(/\.(heic|heif|jpe?g|png|webp)$/i, "") + ".jpg";
}

async function fileToJpegBlob(file: File): Promise<Blob> {
  if (isHeicFile(file)) {
    const result = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.88,
    });
    return Array.isArray(result) ? result[0] : result;
  }

  if (/^image\/(jpeg|png|webp)$/i.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name)) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("JPEG encode failed"))),
        "image/jpeg",
        0.88,
      );
    });
    return blob;
  }

  throw new Error("Use HEIC, JPG, PNG, or WebP");
}

async function uploadJpeg(name: string, blob: Blob): Promise<string> {
  const res = await fetch(`/api/project-photos?name=${encodeURIComponent(name)}`, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });
  const data = (await res.json()) as { ok: boolean; src?: string; error?: string };
  if (!res.ok || !data.ok || !data.src) {
    throw new Error(data.error || "Upload failed — is the preview server running?");
  }
  return data.src;
}

async function publishToRepo(): Promise<string> {
  const res = await fetch("/api/project-photos/publish", { method: "POST" });
  const data = (await res.json()) as {
    ok: boolean;
    committed?: boolean;
    pushed?: boolean;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Publish failed");
  }
  if (data.committed && data.pushed) return "Saved to Projects and pushed to the repo.";
  if (data.committed) return "Committed locally — push may need a retry.";
  return "Already on Projects (nothing new to commit).";
}

export function MediaConverter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [banner, setBanner] = useState("");

  const patchItem = useCallback((id: string, patch: Partial<QueueItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!files.length) return;

      setBusy(true);
      setBanner("");
      const seeded: QueueItem[] = files.map((file, i) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${i}`,
        name: jpgName(file.name),
        status: "queued",
      }));
      setItems(seeded);

      let uploaded = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const id = seeded[i].id;
        try {
          patchItem(id, { status: "converting" });
          const blob = await fileToJpegBlob(file);
          patchItem(id, { status: "uploading" });
          const src = await uploadJpeg(jpgName(file.name), blob);
          patchItem(id, { status: "done", src });
          uploaded += 1;
        } catch (err) {
          patchItem(id, {
            status: "error",
            error: err instanceof Error ? err.message : "Failed",
          });
        }
      }

      if (uploaded > 0) {
        try {
          const msg = await publishToRepo();
          setBanner(`${uploaded} photo${uploaded === 1 ? "" : "s"} added. ${msg}`);
        } catch (err) {
          setBanner(
            `${uploaded} photo${uploaded === 1 ? "" : "s"} saved to Projects on this preview. Publish note: ${
              err instanceof Error ? err.message : "could not push"
            }`,
          );
        }
      } else {
        setBanner("No photos were uploaded.");
      }

      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    },
    [patchItem],
  );

  return (
    <div className="media-converter">
      <h2 id="media-converter-title">Project photo dump</h2>
      <p>
        Drop job photos here (HEIC from iPhone is fine). They convert in your browser, land in the
        Projects gallery, and publish to the site branch when the preview server can push.
      </p>

      <div
        className={dragOver ? "media-converter__bucket is-dragover" : "media-converter__bucket"}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!busy) void processFiles(e.dataTransfer.files);
        }}
      >
        <p className="media-converter__bucket-title">
          {busy ? "Uploading…" : "Drop photos here"}
        </p>
        <p className="media-converter__bucket-sub">or</p>
        <label className="media-converter__pick">
          <input
            ref={inputRef}
            type="file"
            accept="image/heic,image/heif,image/jpeg,image/png,image/webp,.heic,.heif,.jpg,.jpeg,.png,.webp"
            multiple
            disabled={busy}
            onChange={(e) => {
              if (e.target.files) void processFiles(e.target.files);
            }}
          />
          Choose from phone
        </label>
      </div>

      {banner ? (
        <p className="media-converter__banner" role="status">
          {banner}{" "}
          <Link to="/projects">Open Projects</Link>
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="media-converter__list">
          {items.map((item) => (
            <li key={item.id} className="media-converter__item">
              {item.src ? (
                <img src={item.src} alt="" className="media-converter__thumb" />
              ) : (
                <span className="media-converter__thumb media-converter__thumb--empty" />
              )}
              <div className="media-converter__meta">
                <span className="media-converter__name">{item.name}</span>
                <span
                  className={
                    item.status === "error"
                      ? "media-converter__error"
                      : "media-converter__status"
                  }
                >
                  {item.status === "queued" && "Queued"}
                  {item.status === "converting" && "Converting…"}
                  {item.status === "uploading" && "Sending to Projects…"}
                  {item.status === "done" && "On Projects"}
                  {item.status === "error" && (item.error || "Error")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="media-converter__hint">
          Works while this site preview is running. Dump a batch, then check{" "}
          <Link to="/projects">Projects</Link>.
        </p>
      )}
    </div>
  );
}
