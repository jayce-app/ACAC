/**
 * Media dump for the Projects page — photos and clips, no captions.
 * Drop files in /public/projects/ and add paths below.
 */

export type ProjectPhoto = { type: "photo"; src: string };
export type ProjectVideo = { type: "video"; src: string; poster: string };
export type ProjectMedia = ProjectPhoto | ProjectVideo;

/** Support / marketing assets that should never appear as gallery tiles. */
const GALLERY_BLOCKLIST = new Set([
  "work-collage",
  "work-collage-home",
  "job-clip-poster",
  "job-clip-steel-frame-poster",
  "readme",
  "manifest",
  "logo",
  "logo-plate",
  "logo-mark",
  "favicon",
]);

function fileStem(src: string): string {
  const base = src.split("/").pop()?.split("?")[0] ?? src;
  return base.replace(/\.[^.]+$/, "").toLowerCase();
}

function normalizeSrc(src: string): string {
  return src.trim().split("?")[0].toLowerCase();
}

export function isGalleryBlocked(src: string): boolean {
  return GALLERY_BLOCKLIST.has(fileStem(src));
}

/** Stable identity for duplicate detection (path + basename, case-insensitive). */
export function mediaDedupeKey(item: ProjectMedia): string {
  if (item.type === "video") {
    return `video:${normalizeSrc(item.src)}`;
  }
  return `photo:${normalizeSrc(item.src)}|stem:${fileStem(item.src)}`;
}

/** Merge curated + dumped media with no duplicate tiles. */
export function mergeProjectMedia(groups: ProjectMedia[][]): ProjectMedia[] {
  const seenKeys = new Set<string>();
  const seenStems = new Set<string>();
  const posterOfVideo = new Set<string>();
  const merged: ProjectMedia[] = [];

  const flat = groups.flat();
  for (const item of flat) {
    if (item.type === "video") {
      posterOfVideo.add(normalizeSrc(item.poster));
    }
  }

  for (const item of flat) {
    if (item.type === "photo") {
      if (isGalleryBlocked(item.src)) continue;
      if (posterOfVideo.has(normalizeSrc(item.src))) continue;
      const stem = fileStem(item.src);
      const key = mediaDedupeKey(item);
      if (seenKeys.has(key) || seenStems.has(stem)) continue;
      seenKeys.add(key);
      seenStems.add(stem);
      merged.push(item);
      continue;
    }

    const key = mediaDedupeKey(item);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    merged.push(item);
  }

  return merged;
}

export const projectMedia: ProjectMedia[] = [
  {
    type: "video",
    src: "/projects/job-clip-steel-frame.mp4",
    poster: "/projects/job-clip-steel-frame-poster.jpg",
  },
  { type: "video", src: "/projects/job-clip.mp4", poster: "/projects/job-clip-poster.jpg" },
  { type: "photo", src: "/projects/img-4425.jpg" },
  { type: "photo", src: "/projects/img-1305.jpg" },
  { type: "photo", src: "/projects/img-1670.jpg" },
  { type: "photo", src: "/projects/img-1547.jpg" },
  { type: "photo", src: "/projects/img-1641.jpg" },
  { type: "photo", src: "/projects/123-1.jpg" },
  { type: "photo", src: "/projects/123-1-1.jpg" },
  { type: "photo", src: "/projects/123-1-2.jpg" },
  { type: "photo", src: "/projects/123-1-3.jpg" },
  { type: "photo", src: "/projects/3077035545266541115.jpg" },
  { type: "photo", src: "/projects/3973031524491744279.jpg" },
  { type: "photo", src: "/projects/4343254866381783839.jpg" },
  { type: "photo", src: "/projects/4911699848699129713.jpg" },
  { type: "photo", src: "/projects/6842604383411589686.jpg" },
  { type: "photo", src: "/projects/7045037573491750232.jpg" },
  { type: "photo", src: "/projects/7348624156828523777.jpg" },
  { type: "photo", src: "/projects/844507593257666756.jpg" },
  { type: "photo", src: "/projects/covered-arena-open-span.jpg" },
  { type: "photo", src: "/projects/timber-pavilion.jpg" },
  { type: "photo", src: "/projects/timber-pavilion-2.jpg" },
  { type: "photo", src: "/projects/luxury-stalls-interior.jpg" },
  { type: "photo", src: "/projects/metal-shop-wrap-porch.jpg" },
  { type: "photo", src: "/projects/outdoor-kitchen-pavilion.jpg" },
  { type: "photo", src: "/projects/steel-cmu-commercial.jpg" },
  { type: "photo", src: "/projects/metal-shop-tan-porch.jpg" },
  { type: "photo", src: "/projects/metal-barn-red.jpg" },
  { type: "photo", src: "/projects/covered-arena-dirt-floor.jpg" },
  { type: "photo", src: "/projects/metal-barn-two-tone.jpg" },
  { type: "photo", src: "/projects/metal-shop-white.jpg" },
  { type: "photo", src: "/projects/metal-shop-multi-bay.jpg" },
  { type: "photo", src: "/projects/metal-shop-charcoal-door.jpg" },
  { type: "photo", src: "/projects/covered-arena-night.jpg" },
  { type: "photo", src: "/projects/metal-shop-tan-porch-2.jpg" },
  { type: "photo", src: "/projects/logo-plate-roofline.jpg" },
  { type: "photo", src: "/projects/concrete-crossing-sitework.jpg" },
  { type: "photo", src: "/projects/metal-building-shop.jpg" },
  { type: "photo", src: "/projects/custom-horse-stalls.jpg" },
  { type: "photo", src: "/projects/job-site-sign.jpg" },
];

/** @deprecated use projectMedia — kept for any old imports */
export const projectPhotos = projectMedia
  .filter((m): m is ProjectPhoto => m.type === "photo")
  .map((m) => m.src);
