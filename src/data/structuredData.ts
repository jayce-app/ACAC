import { company } from "../data/content";
import { siteUrl } from "../data/site";

/** LocalBusiness / GeneralContractor JSON-LD for search engines. */
export function buildLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["GeneralContractor", "LocalBusiness"],
    "@id": `${siteUrl}/#business`,
    name: company.name,
    legalName: company.legal,
    description:
      "Custom residential and commercial construction — metal buildings, structural steel, dirt and site work, and turnkey builds across Southeast Texas.",
    url: siteUrl,
    telephone: company.phone,
    email: company.email,
    image: [`${siteUrl}/logo.jpg`, `${siteUrl}/hero.jpg`],
    logo: `${siteUrl}/logo.jpg`,
    slogan: company.tagline,
    founder: {
      "@type": "Person",
      name: company.owner,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address,
      addressLocality: "Bellville",
      addressRegion: "TX",
      postalCode: "77418",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Southeast Texas" },
      { "@type": "City", name: "Bellville" },
      { "@type": "City", name: "Brenham" },
      { "@type": "City", name: "Sealy" },
      { "@type": "City", name: "Columbus" },
      { "@type": "City", name: "Hempstead" },
      { "@type": "City", name: "Waller" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "17:00",
      },
    ],
    sameAs: [company.facebook],
    priceRange: "$$",
    knowsAbout: [
      "Metal buildings",
      "Structural steel",
      "Dirt work",
      "Site preparation",
      "Covered arenas",
      "Barndominiums",
      "General contracting",
    ],
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: company.name,
    description:
      "Official website for TX Ropers Construction, LLC — metal buildings and custom construction in Bellville, Texas.",
    publisher: { "@id": `${siteUrl}/#business` },
    inLanguage: "en-US",
  };
}
