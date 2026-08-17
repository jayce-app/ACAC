/** Compress an image file to a JPEG data URL for application storage. */
export async function fileToCompressedDataUrl(
  file: File,
  maxEdge = 1280,
  quality = 0.72,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload image files only (JPEG, PNG, or WebP).");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not process that image. Try a different photo.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Could not process that image. Try a different photo.");
  }
  return dataUrl;
}

/** Rough uniqueness check so the same photo is not uploaded twice. */
export function photosAreUnique(dataUrls: string[]): boolean {
  const fingerprints = dataUrls.map((url) => {
    // Compare length + a slice of payload (skip the data URL header)
    const payload = url.slice(url.indexOf(",") + 1);
    return `${url.length}:${payload.slice(0, 64)}:${payload.slice(-64)}`;
  });
  return new Set(fingerprints).size === fingerprints.length;
}
