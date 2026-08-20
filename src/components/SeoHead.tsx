import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { company } from "../data/content";
import { defaultDescription, seoForPath, siteUrl } from "../data/site";
import { buildLocalBusinessJsonLd, buildWebsiteJsonLd } from "../data/structuredData";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** Keeps document title, description, canonical, and social tags in sync with the route. */
export function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    upsertJsonLd("ld-local-business", {
      "@context": "https://schema.org",
      "@graph": [buildLocalBusinessJsonLd(), buildWebsiteJsonLd()],
    });
  }, []);

  useEffect(() => {
    const page = seoForPath(pathname);
    const url = `${siteUrl}${page.path === "/" ? "/" : page.path}`;
    const image = `${siteUrl}/hero.jpg`;
    const title = page.title;
    const description = page.description || defaultDescription;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", "index, follow, max-image-preview:large");
    upsertMeta("name", "author", company.legal);
    upsertMeta("name", "geo.region", "US-TX");
    upsertMeta("name", "geo.placename", "Bellville");

    upsertLink("canonical", url);

    upsertMeta("property", "og:type", page.path === "/" ? "website" : "article");
    upsertMeta("property", "og:site_name", company.name);
    upsertMeta("property", "og:locale", "en_US");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta(
      "property",
      "og:image:alt",
      `${company.name} — metal building project in Southeast Texas`,
    );

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
  }, [pathname]);

  return null;
}
