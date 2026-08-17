/**
 * Media dump for the Projects page — photos and clips, no captions.
 * Drop files in /public/projects/ and add paths below.
 */

export type ProjectPhoto = { type: "photo"; src: string };
export type ProjectVideo = { type: "video"; src: string; poster: string };
export type ProjectMedia = ProjectPhoto | ProjectVideo;

export const projectMedia: ProjectMedia[] = [
  { type: "video", src: "/projects/job-clip.mp4", poster: "/projects/job-clip-poster.jpg" },
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
