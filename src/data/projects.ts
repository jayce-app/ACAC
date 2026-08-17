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
  category: "Metal buildings" | "Dirt & site work" | "Structural steel" | "Interiors" | "Commercial" | "Custom builds";
  location?: string;
  blurb?: string;
  /** Path under /public, e.g. /projects/my-job.jpg */
  image: string;
};

export const projects: Project[] = [
  {
    id: "timber-pavilion",
    title: "Timber outdoor pavilion",
    category: "Custom builds",
    location: "Southeast Texas",
    blurb: "Heavy timber outdoor living structure on a concrete pad — custom, start to finish.",
    image: "/projects/timber-pavilion.jpg",
  },
  {
    id: "luxury-stalls",
    title: "Custom stall barn interior",
    category: "Interiors",
    location: "Southeast Texas",
    blurb: "Wood-lined stalls, vaulted ceiling, and finished concrete — custom interior work.",
    image: "/projects/luxury-stalls-interior.jpg",
  },
  {
    id: "outdoor-kitchen",
    title: "Outdoor kitchen pavilion",
    category: "Custom builds",
    location: "Southeast Texas",
    blurb: "Pass-through outdoor kitchen and living space under a timber roof.",
    image: "/projects/outdoor-kitchen-pavilion.jpg",
  },
  {
    id: "metal-wrap-porch",
    title: "Metal shop with wrap porch",
    category: "Metal buildings",
    location: "Southeast Texas",
    blurb: "Multi-door metal shop with steel wrap porch and graded site work.",
    image: "/projects/metal-shop-wrap-porch.jpg",
  },
  {
    id: "metal-tan-porch",
    title: "Tan metal shop with porch",
    category: "Metal buildings",
    location: "Southeast Texas",
    blurb: "Turnkey metal building with covered porch, roll-ups, and concrete slab.",
    image: "/projects/metal-shop-tan-porch.jpg",
  },
  {
    id: "metal-tan-porch-2",
    title: "Tan metal shop — side view",
    category: "Metal buildings",
    location: "Southeast Texas",
    blurb: "Same custom shop from the porch side — slab, steel, and metal shell.",
    image: "/projects/metal-shop-tan-porch-2.jpg",
  },
  {
    id: "metal-barn-red",
    title: "Red metal barn",
    category: "Metal buildings",
    location: "Southeast Texas",
    blurb: "Bold red metal building with white trim on a fresh pad.",
    image: "/projects/metal-barn-red.jpg",
  },
  {
    id: "metal-shop-white",
    title: "White metal shop",
    category: "Metal buildings",
    location: "Southeast Texas",
    blurb: "Clean metal shop shell with charcoal trim and roll-up access.",
    image: "/projects/metal-shop-white.jpg",
  },
  {
    id: "metal-multi-bay",
    title: "Multi-bay metal shop",
    category: "Metal buildings",
    location: "Southeast Texas",
    blurb: "Multi-bay metal structure with lean-to and open work bays.",
    image: "/projects/metal-shop-multi-bay.jpg",
  },
  {
    id: "metal-charcoal-door",
    title: "Shop with charcoal bay door",
    category: "Metal buildings",
    location: "Southeast Texas",
    blurb: "Tan metal shop front with charcoal roll-up and exterior lighting.",
    image: "/projects/metal-shop-charcoal-door.jpg",
  },
  {
    id: "covered-arena",
    title: "Covered arena / open span",
    category: "Metal buildings",
    location: "Southeast Texas",
    blurb: "Open-front steel structure — covered span over dirt.",
    image: "/projects/covered-arena-night.jpg",
  },
  {
    id: "concrete-crossing",
    title: "Concrete crossing & site work",
    category: "Dirt & site work",
    location: "Southeast Texas",
    blurb: "Graded access, gravel approach, and poured concrete crossing.",
    image: "/projects/concrete-crossing-sitework.jpg",
  },
  {
    id: "job-site-sign",
    title: "On the job",
    category: "Commercial",
    location: "Southeast Texas",
    blurb: "TX Ropers Construction on site.",
    image: "/projects/job-site-sign.jpg",
  },
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
    blurb: "Wood-and-steel stalls built inside a covered metal structure — from the dirt up.",
    image: "/projects/custom-horse-stalls.jpg",
  },
];

export const projectCategories = [
  "All",
  "Metal buildings",
  "Custom builds",
  "Dirt & site work",
  "Structural steel",
  "Interiors",
  "Commercial",
] as const;
