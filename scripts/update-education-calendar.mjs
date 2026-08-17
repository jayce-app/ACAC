#!/usr/bin/env node
/**
 * Fetches construction-trade education opportunities from public source calendars
 * and regenerates src/data/educationGenerated.json for the ACAC education page.
 *
 * Sources:
 * - Texas DWC / TDI public outreach calendar (OSHA construction, CPR, etc.)
 * - TACCA continuing education upcoming events
 *
 * Usage: npm run update:education
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outPath = join(root, "src/data/educationGenerated.json");
const manualPath = join(root, "src/data/educationManual.json");

const UA =
  "Mozilla/5.0 (compatible; ACAC-EducationCalendar/1.0; +https://jayce-app.github.io/ACAC/)";

const MONTHS = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&raquo;/gi, "»")
    .replace(/&#\d+;/g, (m) => {
      const n = Number(m.slice(2, -1));
      return Number.isFinite(n) ? String.fromCharCode(n) : m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toIso(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseMonthDayYear(raw) {
  const m = raw.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(\d{4})/i,
  );
  if (!m) return null;
  return toIso(Number(m[3]), MONTHS[m[1].toLowerCase()], Number(m[2]));
}

function parseSlashDate(raw) {
  const m = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  return toIso(Number(m[3]), Number(m[1]), Number(m[2]));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.text();
}

function isConstructionRelevant(title) {
  const t = title.toLowerCase();
  if (/general industry/.test(t) && !/construction/.test(t)) return false;
  if (/designated doctor|public hearing|agency closed|stakeholder|health care/.test(t)) {
    return false;
  }
  return (
    /osha.*construction|construction.*osha|osha\s*10|osha\s*30/.test(t) ||
    /cpr|first aid|aed/.test(t) ||
    /construction/.test(t)
  );
}

function tradeFocusFor(title) {
  const t = title.toLowerCase();
  if (/osha\s*30/.test(t)) return "Jobsite safety — supervisors & leads";
  if (/osha\s*10|osha.*construction/.test(t)) return "Jobsite safety — all trades";
  if (/cpr|first aid|aed/.test(t)) return "Jobsite safety — first aid";
  return "Construction trades";
}

function costFor(title) {
  if (/osha\s*30/.test(title.toLowerCase())) return "$30 (typical DWC fee; confirm on registration)";
  if (/osha\s*10/.test(title.toLowerCase())) {
    return "Free / low-cost (registration required; confirm on listing)";
  }
  return "See registration";
}

function resolveUrl(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function fetchDwcEvents(html, pageUrl) {
  const events = [];
  const liRe =
    /<li>\s*<a href="([^"]+)"[^>]*title="([^"]+)"[^>]*>[\s\S]*?<\/a>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = liRe.exec(html))) {
    const href = match[1];
    const title = decodeEntities(match[2]).replace(/\s+/g, " ").trim();
    const rest = match[3];
    if (!isConstructionRelevant(title)) continue;

    const locationMatch = rest.match(/-\s*([A-Za-z .'-]+)\s*<br/i);
    const location = locationMatch
      ? `${locationMatch[1].trim()}, TX`
      : "Texas (see listing)";

    const dates = [...rest.matchAll(/<strong>([^<]+)<\/strong>/gi)].map((m) =>
      parseMonthDayYear(m[1]),
    ).filter(Boolean);

    if (!dates.length) continue;
    const startDate = dates[0];
    const endDate = dates[1] && dates[1] !== dates[0] ? dates[1] : undefined;
    const url = resolveUrl(href, pageUrl);
    const id = `dwc-${slugify(title)}-${startDate}`;

    events.push({
      id,
      title,
      organizer: "Texas Division of Workers’ Compensation (TDI/DWC)",
      tradeFocus: tradeFocusFor(title),
      startDate,
      ...(endDate ? { endDate } : {}),
      location,
      format: "In person",
      cost: costFor(title),
      summary: `${title} offered through Texas DWC’s public safety training calendar. Confirm seats, language, and fees on the official listing before registering.`,
      url,
      source: "tdi-dwc",
    });
  }
  return events;
}

function fetchTaccaEvents(html) {
  const events = [];
  const blockRe =
    /<div class='UpcomingEvents[^']*'>\s*<p id="([^"]+)">([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = blockRe.exec(html))) {
    const blockId = match[1];
    const inner = match[2];
    const linkMatch = inner.match(/<a href='([^']+)'>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;
    const href = linkMatch[1];
    const title = stripTags(linkMatch[2]);
    if (!title) continue;

    // Skip prep-book bundles that duplicate class-only listings when both exist —
    // keep CE and license prep that are useful to contractors.
    const isCe = /continuing education|tdlr/i.test(title);
    const isPrep = /license preparat|exam prep/i.test(title);
    if (!isCe && !isPrep) continue;
    if (/bundle/i.test(title) && /books/i.test(title)) continue;

    const dateChunk = stripTags(inner.split("<a")[0]);
    const slashDates = [...dateChunk.matchAll(/(\d{1,2}\/\d{1,2}\/\d{4})/g)].map(
      (m) => parseSlashDate(m[1]),
    ).filter(Boolean);
    if (!slashDates.length) continue;

    const startDate = slashDates[0];
    const endDate =
      slashDates[1] && slashDates[1] !== slashDates[0] ? slashDates[1] : undefined;

    let location = "Texas";
    const locMatch = title.match(
      /^(Corpus Christi|San Antonio|Houston|Waco|Austin|Dallas|Fort Worth|Grapevine|El Paso|Lubbock|Amarillo|Tyler|Beaumont|McAllen|Laredo|Midland|Odessa|College Station|Bryan)\b/i,
    );
    if (locMatch) location = `${locMatch[1]}, TX`;
    else if (/online/i.test(title)) location = "Online (Texas)";

    const url = resolveUrl(href, "https://www.tacca.org/");
    const id = `tacca-${blockId.toLowerCase()}-${startDate}`;

    events.push({
      id,
      title,
      organizer: "Texas Air Conditioning Contractors Association",
      tradeFocus: isPrep ? "HVAC / ACR license prep" : "HVAC / ACR",
      startDate,
      ...(endDate ? { endDate } : {}),
      location,
      format: /online/i.test(title) ? "Online" : "In person",
      cost: "See TACCA registration",
      summary: isPrep
        ? "TACCA ACR license preparatory class. Confirm class-only vs bundle options and current fees on TACCA’s event page."
        : "TDLR-approved HVAC/ACR continuing education through TACCA. Confirm laws-and-rules credit and seating on the registration page.",
      url,
      source: "tacca",
    });
  }
  return events;
}

function dedupe(events) {
  const seen = new Set();
  const out = [];
  for (const event of events) {
    const key = `${event.title.toLowerCase()}|${event.startDate}|${event.location.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(event);
  }
  return out;
}

function loadManual() {
  try {
    const raw = JSON.parse(readFileSync(manualPath, "utf8"));
    return raw.map((event) => ({ ...event, source: "manual" }));
  } catch {
    return [];
  }
}

async function main() {
  const sources = [];
  const errors = [];

  let dwcEvents = [];
  try {
    const dwcUrl = "https://www.tdi.texas.gov/wc/events/index.html";
    const html = await fetchText(dwcUrl);
    dwcEvents = fetchDwcEvents(html, dwcUrl);
    sources.push({ id: "tdi-dwc", ok: true, count: dwcEvents.length });
  } catch (err) {
    errors.push(`tdi-dwc: ${err instanceof Error ? err.message : String(err)}`);
    sources.push({ id: "tdi-dwc", ok: false, count: 0 });
  }

  let taccaEvents = [];
  try {
    const taccaUrl = "https://www.tacca.org/page/CE";
    const html = await fetchText(taccaUrl);
    taccaEvents = fetchTaccaEvents(html);
    sources.push({ id: "tacca", ok: true, count: taccaEvents.length });
  } catch (err) {
    errors.push(`tacca: ${err instanceof Error ? err.message : String(err)}`);
    sources.push({ id: "tacca", ok: false, count: 0 });
  }

  const manual = loadManual();
  const generated = dedupe([...dwcEvents, ...taccaEvents]).sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  if (generated.length === 0 && errors.length) {
    console.error("Education calendar update failed; no generated events.");
    for (const e of errors) console.error(` - ${e}`);
    process.exit(1);
  }

  const payload = {
    lastUpdated: new Date().toISOString(),
    sources,
    events: generated,
    manualCount: manual.length,
  };

  writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${generated.length} generated events (+ ${manual.length} manual) to ${outPath}`,
  );
  for (const s of sources) {
    console.log(`  ${s.id}: ${s.ok ? "ok" : "FAIL"} (${s.count})`);
  }
  if (errors.length) {
    for (const e of errors) console.warn(`  warn: ${e}`);
  }
}

await main();
