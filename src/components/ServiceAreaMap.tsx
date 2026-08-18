/**
 * Service-area map: accurate Texas outline with Bellville pin and radius bands.
 * Pure SVG — no map API key. Intended as a background behind section copy.
 */

/** Geographic bounds of the simplified outline (lon/lat). */
const TEXAS = {
  minLon: -106.6436,
  maxLon: -93.5263,
  minLat: 25.8876,
  maxLat: 36.5019,
};

const BELLVILLE = { lat: 29.9502, lon: -96.2572 };

/** Simplified Texas outline from GeoJSON (Douglas–Peucker). */
const TEXAS_OUTLINE: Array<[number, number]> = [
  [-101.8129, 36.5019],
  [-100.0001, 36.5019],
  [-100.0001, 34.563],
  [-99.6988, 34.3823],
  [-99.2607, 34.4042],
  [-99.1895, 34.2125],
  [-98.5706, 34.1468],
  [-98.4884, 34.0646],
  [-98.3625, 34.1577],
  [-98.1708, 34.1139],
  [-97.8695, 33.851],
  [-97.6943, 33.9825],
  [-97.3711, 33.8236],
  [-97.2561, 33.862],
  [-97.174, 33.736],
  [-96.922, 33.9606],
  [-96.8508, 33.8455],
  [-96.6318, 33.8455],
  [-96.347, 33.6867],
  [-96.1498, 33.8401],
  [-95.6021, 33.9332],
  [-95.2899, 33.8729],
  [-95.2242, 33.9606],
  [-94.3807, 33.5443],
  [-94.0412, 33.5498],
  [-94.0412, 31.9943],
  [-93.8221, 31.7753],
  [-93.8166, 31.5562],
  [-93.5428, 31.1509],
  [-93.5263, 30.9373],
  [-93.729, 30.5758],
  [-93.6906, 30.1431],
  [-93.9261, 29.7871],
  [-93.8385, 29.6885],
  [-94.5231, 29.5461],
  [-94.7094, 29.6228],
  [-94.7422, 29.7871],
  [-94.9668, 29.6995],
  [-95.0161, 29.5571],
  [-94.912, 29.4969],
  [-94.8956, 29.3106],
  [-95.383, 28.867],
  [-95.9855, 28.6041],
  [-96.4784, 28.5986],
  [-96.6646, 28.6972],
  [-96.4017, 28.4398],
  [-96.5934, 28.3577],
  [-96.7742, 28.4069],
  [-96.8015, 28.2262],
  [-97.0261, 28.04],
  [-97.5409, 27.2294],
  [-97.4259, 27.2623],
  [-97.5628, 26.8405],
  [-97.2178, 25.9916],
  [-97.5245, 25.8876],
  [-97.6505, 26.019],
  [-98.1982, 26.0573],
  [-99.1731, 26.5393],
  [-99.2662, 26.8405],
  [-99.4469, 27.0213],
  [-99.4798, 27.4813],
  [-100.2958, 28.281],
  [-100.6737, 29.1025],
  [-101.2598, 29.5352],
  [-101.4131, 29.7543],
  [-102.3387, 29.8693],
  [-102.388, 29.7652],
  [-102.629, 29.7324],
  [-103.1165, 28.9875],
  [-103.2808, 28.982],
  [-104.5076, 29.6393],
  [-104.8965, 30.5703],
  [-106.2054, 31.4686],
  [-106.3807, 31.7314],
  [-106.6436, 31.9012],
  [-106.6162, 31.9998],
  [-103.0672, 31.9998],
  [-103.0398, 36.5019],
];

const WIDTH = 800;
const HEIGHT = 756;
const PAD = 12;
const LON_SPAN = TEXAS.maxLon - TEXAS.minLon;
const LAT_SPAN = TEXAS.maxLat - TEXAS.minLat;
const MILES_PER_DEG_LAT = 69.0;
const MILES_PER_DEG_LON = Math.cos((BELLVILLE.lat * Math.PI) / 180) * 69.17;

function project(lon: number, lat: number) {
  const x = PAD + ((lon - TEXAS.minLon) / LON_SPAN) * (WIDTH - 2 * PAD);
  const y = PAD + ((TEXAS.maxLat - lat) / LAT_SPAN) * (HEIGHT - 2 * PAD);
  return { x, y };
}

function radiusAxes(miles: number) {
  const rx = (miles / MILES_PER_DEG_LON / LON_SPAN) * (WIDTH - 2 * PAD);
  const ry = (miles / MILES_PER_DEG_LAT / LAT_SPAN) * (HEIGHT - 2 * PAD);
  return { rx, ry };
}

const texasPath =
  TEXAS_OUTLINE.map(([lon, lat], i) => {
    const { x, y } = project(lon, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";

export const SERVICE_AREA_BANDS = [
  { miles: 100, label: "100 mi — special projects" },
  { miles: 50, label: "50 mi — primary area" },
  { miles: 25, label: "25 mi" },
] as const;

const pin = project(BELLVILLE.lon, BELLVILLE.lat);

const nearby = [
  { name: "Houston", lat: 29.76, lon: -95.37 },
  { name: "Austin", lat: 30.27, lon: -97.74 },
  { name: "San Antonio", lat: 29.42, lon: -98.49 },
  { name: "Brenham", lat: 30.17, lon: -96.4 },
];

type Props = {
  /** Decorative background mode — no caption, softer styling. */
  background?: boolean;
};

export function ServiceAreaMap({ background = false }: Props) {
  return (
    <div className={background ? "service-map service-map--bg" : "service-map"}>
      <svg
        className="service-map__svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role={background ? "presentation" : "img"}
        aria-hidden={background ? true : undefined}
        aria-label={
          background
            ? undefined
            : "Map of Texas showing Bellville and the TX Ropers Construction service area radius"
        }
      >
        <defs>
          <clipPath id="texas-clip">
            <path d={texasPath} />
          </clipPath>
        </defs>

        <path
          d={texasPath}
          className="service-map__state"
          fill="rgba(192, 197, 204, 0.07)"
          stroke="rgba(230, 231, 232, 0.55)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <g clipPath="url(#texas-clip)">
          {SERVICE_AREA_BANDS.map((band) => {
            const { rx, ry } = radiusAxes(band.miles);
            const isPrimary = band.miles === 50;
            const isOuter = band.miles === 100;
            return (
              <ellipse
                key={band.miles}
                cx={pin.x}
                cy={pin.y}
                rx={rx}
                ry={ry}
                fill={
                  isPrimary
                    ? "rgba(192, 197, 204, 0.16)"
                    : isOuter
                      ? "rgba(192, 197, 204, 0.06)"
                      : "rgba(230, 231, 232, 0.1)"
                }
                stroke={
                  isPrimary
                    ? "rgba(230, 231, 232, 0.7)"
                    : "rgba(192, 197, 204, 0.4)"
                }
                strokeWidth={isPrimary ? 1.75 : 1.25}
                strokeDasharray={isOuter ? "6 5" : undefined}
              />
            );
          })}
        </g>

        {nearby.map((city) => {
          const p = project(city.lon, city.lat);
          return (
            <g key={city.name} className="service-map__city">
              <circle cx={p.x} cy={p.y} r="2.25" fill="rgba(154, 161, 171, 0.85)" />
              <text
                x={p.x + 7}
                y={p.y + 3}
                fill="rgba(192, 197, 204, 0.75)"
                fontSize="13"
                fontFamily="Outfit, system-ui, sans-serif"
              >
                {city.name}
              </text>
            </g>
          );
        })}

        <g className="service-map__pin">
          <circle cx={pin.x} cy={pin.y} r="8" fill="rgba(230, 231, 232, 0.95)" />
          <circle cx={pin.x} cy={pin.y} r="3.75" fill="#152238" />
          <text
            x={pin.x + 12}
            y={pin.y - 10}
            fill="#e6e7e8"
            fontSize="15"
            fontWeight="700"
            fontFamily="Oswald, Arial Narrow, sans-serif"
            letterSpacing="0.06em"
          >
            BELLVILLE
          </text>
        </g>
      </svg>
    </div>
  );
}

export function ServiceAreaLegend() {
  return (
    <ul className="service-map__legend">
      {SERVICE_AREA_BANDS.map((band) => (
        <li key={band.miles}>
          <span
            className={
              band.miles === 50
                ? "service-map__swatch service-map__swatch--primary"
                : band.miles === 100
                  ? "service-map__swatch service-map__swatch--outer"
                  : "service-map__swatch"
            }
          />
          {band.label}
        </li>
      ))}
    </ul>
  );
}
