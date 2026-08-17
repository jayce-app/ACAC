import { useRef, useState } from "react";
import heic2any from "heic2any";
import JSZip from "jszip";
import "./MediaConverter.css";

type ConvertedItem = {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  status: "ready" | "error";
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
    const blob = Array.isArray(result) ? result[0] : result;
    return blob;
  }

  // Re-encode common phone formats to JPEG for a consistent download
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

  throw new Error("Unsupported file type — use HEIC, JPG, PNG, or WebP");
}

export function MediaConverter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [items, setItems] = useState<ConvertedItem[]>([]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    setBusy(true);
    setProgress(`Converting 0 of ${files.length}…`);

    const next: ConvertedItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Converting ${i + 1} of ${files.length}: ${file.name}`);
      const id = `${file.name}-${file.size}-${file.lastModified}-${i}`;
      try {
        const blob = await fileToJpegBlob(file);
        next.push({
          id,
          name: jpgName(file.name),
          blob,
          url: URL.createObjectURL(blob),
          status: "ready",
        });
      } catch (err) {
        next.push({
          id,
          name: file.name,
          blob: new Blob(),
          url: "",
          status: "error",
          error: err instanceof Error ? err.message : "Conversion failed",
        });
      }
    }

    setItems((prev) => {
      prev.forEach((item) => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
      return next;
    });
    setBusy(false);
    setProgress("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function downloadZip() {
    const ready = items.filter((item) => item.status === "ready");
    if (!ready.length) return;
    setBusy(true);
    setProgress("Building ZIP…");
    const zip = new JSZip();
    for (const item of ready) {
      zip.file(item.name, item.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tx-ropers-project-photos.jpg.zip".replace(".jpg.zip", ".zip");
    a.click();
    URL.revokeObjectURL(url);
    setBusy(false);
    setProgress("");
  }

  const readyCount = items.filter((item) => item.status === "ready").length;

  return (
    <div className="media-converter">
      <h2 id="media-converter-title">Photo converter</h2>
      <p>
        Convert phone photos (HEIC/HEIF) to JPG in your browser. Files stay on your device — nothing
        is uploaded to a server. After converting, download the JPGs and add them to the site (or
        send them in chat one at a time).
      </p>

      <div className="media-converter__actions">
        <label className="media-converter__pick">
          <input
            ref={inputRef}
            type="file"
            accept="image/heic,image/heif,image/jpeg,image/png,image/webp,.heic,.heif,.jpg,.jpeg,.png,.webp"
            multiple
            disabled={busy}
            onChange={(e) => void handleFiles(e.target.files)}
          />
          {busy ? "Working…" : "Choose photos"}
        </label>
        <button
          type="button"
          className="media-converter__zip"
          disabled={busy || readyCount === 0}
          onClick={() => void downloadZip()}
        >
          Download all as ZIP
        </button>
      </div>

      {progress ? (
        <p className="media-converter__progress" role="status">
          {progress}
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="media-converter__list">
          {items.map((item) => (
            <li key={item.id} className="media-converter__item">
              {item.status === "ready" ? (
                <>
                  <img src={item.url} alt="" className="media-converter__thumb" />
                  <div className="media-converter__meta">
                    <span className="media-converter__name">{item.name}</span>
                    <a className="media-converter__dl" href={item.url} download={item.name}>
                      Download JPG
                    </a>
                  </div>
                </>
              ) : (
                <div className="media-converter__meta">
                  <span className="media-converter__name">{item.name}</span>
                  <span className="media-converter__error">{item.error}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="media-converter__hint">
          Tip on iPhone: Photos → select → Share → Save to Files, then pick them here. Or use “Choose
          photos” and select from your library if the browser allows.
        </p>
      )}
    </div>
  );
}
