/** Canonical public site URL (no trailing slash). */
export const siteUrl = "https://www.txropersconstruction.com";

export type PageSeo = {
  path: string;
  title: string;
  description: string;
  /** Lower = less important in sitemap (0–1). */
  priority?: number;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
};

export const defaultDescription =
  "TX Ropers Construction, LLC — turnkey metal buildings, structural steel, dirt and site work, and custom construction out of Bellville, Texas.";

/** Per-route titles and descriptions for search engines and social shares. */
export const pageSeo: PageSeo[] = [
  {
    path: "/",
    title: "TX Ropers Construction | Metal Buildings & Site Work in Bellville, TX",
    description:
      "Custom metal buildings, structural steel, dirt work, and turnkey construction across Southeast Texas. Based in Bellville — Turning Visions Into Reality.",
    priority: 1,
    changefreq: "weekly",
  },
  {
    path: "/services",
    title: "Services | Metal Buildings, Steel & Dirt Work | TX Ropers Construction",
    description:
      "General construction, metal buildings and structural steel, and dirt and site work for residential and commercial projects near Bellville, Texas.",
    priority: 0.9,
    changefreq: "weekly",
  },
  {
    path: "/projects",
    title: "Projects | TX Ropers Construction Job Gallery",
    description:
      "See metal buildings, covered arenas, shops, stalls, and site work from TX Ropers Construction across Southeast Texas.",
    priority: 0.9,
    changefreq: "weekly",
  },
  {
    path: "/about",
    title: "About | TX Ropers Construction — Bellville, Texas",
    description:
      "Meet owner Jayce Johnson and the TX Ropers Construction crew — custom, turnkey builds with certified welders serving Southeast Texas.",
    priority: 0.8,
    changefreq: "monthly",
  },
  {
    path: "/contact",
    title: "Contact & Quote Request | TX Ropers Construction",
    description:
      "Request a quote from TX Ropers Construction. Call 979-353-1292 or email sales@txropersconstruction.com — Bellville, Texas office.",
    priority: 0.8,
    changefreq: "monthly",
  },
  {
    path: "/copyright",
    title: "Copyright | TX Ropers Construction",
    description: "Copyright and ownership notice for TX Ropers Construction, LLC website content and media.",
    priority: 0.2,
    changefreq: "yearly",
  },
  {
    path: "/southeast-texas-construction",
    title: "Southeast Texas Construction | Metal Buildings Near Bellville",
    description:
      "Metal building contractor, dirt work, structural steel, and turnkey construction serving Bellville, Brenham, Sealy, and Southeast Texas.",
    priority: 0.7,
    changefreq: "weekly",
  },
];

export function seoForPath(pathname: string): PageSeo {
  const normalized = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  return pageSeo.find((page) => page.path === normalized) ?? pageSeo[0]!;
}
