export type GeocodeResult = {
  lat: number;
  lng: number;
  label: string;
};

type CensusMatch = {
  matchedAddress?: string;
  coordinates?: { x?: number; y?: number };
};

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
};

function formatPhotonLabel(props: PhotonFeature["properties"]): string {
  if (!props) return "";
  const line1 = [props.housenumber, props.street || props.name].filter(Boolean).join(" ");
  const place = props.city || props.town || props.village || "";
  const line2 = [place, props.state, props.postcode].filter(Boolean).join(", ");
  return [line1, line2].filter(Boolean).join(", ") || props.name || "";
}

async function geocodeWithCensus(query: string): Promise<GeocodeResult | null> {
  const url = new URL(
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress",
  );
  url.searchParams.set("address", query);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = (await res.json()) as {
    result?: { addressMatches?: CensusMatch[] };
  };
  const match = data.result?.addressMatches?.[0];
  const lng = match?.coordinates?.x;
  const lat = match?.coordinates?.y;
  if (!match || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return {
    lat: Number((lat as number).toFixed(6)),
    lng: Number((lng as number).toFixed(6)),
    label: match.matchedAddress || query,
  };
}

async function geocodeWithPhoton(query: string): Promise<GeocodeResult | null> {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("lang", "en");
  url.searchParams.set("lat", "29.95");
  url.searchParams.set("lon", "-96.26");

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as { features?: PhotonFeature[] };
  const feature = data.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!feature || !coords || coords.length < 2) return null;
  const [lng, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    label: formatPhotonLabel(feature.properties) || query,
  };
}

/**
 * Resolve a U.S. street address to lat/lng.
 * Prefers the Census Bureau geocoder (street-level), then Photon as fallback.
 */
export async function geocodeAddress(
  query: string,
): Promise<{ ok: true; result: GeocodeResult } | { ok: false; message: string }> {
  const q = query.trim();
  if (q.length < 5) {
    return { ok: false, message: "Enter a fuller street address (include city and state)." };
  }

  try {
    const census = await geocodeWithCensus(q);
    if (census) return { ok: true, result: census };

    const photon = await geocodeWithPhoton(q);
    if (photon) return { ok: true, result: photon };

    return {
      ok: false,
      message: "No match for that address. Check the spelling or add city/state/ZIP.",
    };
  } catch {
    return {
      ok: false,
      message: "Could not reach the address service. Check your connection and try again.",
    };
  }
}
