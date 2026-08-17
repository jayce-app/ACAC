/**
 * Project gallery entries.
 *
 * To add a photo:
 * 1. Drop the image file into /public/projects/ (jpg, png, or webp)
 * 2. Add an object below with the matching image path
 *
 * Tip: use clean, well-lit completion photos without clutter.
 */
export type Project = {
  id: string;
  title: string;
  category: "Metal buildings" | "Dirt & site work" | "Structural steel" | "Interiors" | "Commercial";
  location?: string;
  blurb?: string;
  /** Path under /public, e.g. /projects/my-job.jpg */
  image: string;
};

export const projects: Project[] = [
  {
    id: "metal-shop",
    title: "Custom metal shop building",
    category: "Metal buildings",
    location: "Bellville, TX",
    blurb: "Turnkey metal building with covered porch, roll-up doors, and charcoal trim.",
    image: "/projects/metal-building-shop.jpg",
  },
  {
    id: "horse-stalls",
    title: "Custom horse stalls",
    category: "Interiors",
    location: "Southeast Texas",
    blurb: "Wood-and-steel stalls built inside a covered metal structure — from the pad up.",
    image: "/projects/custom-horse-stalls.jpg",
  },
];

export const projectCategories = [
  "All",
  "Metal buildings",
  "Dirt & site work",
  "Structural steel",
  "Interiors",
  "Commercial",
] as const;
