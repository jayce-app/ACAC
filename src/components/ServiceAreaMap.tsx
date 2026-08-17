/**
 * Service-area map: Texas outline with Bellville pin and radius bands.
 * Pure SVG — no map API key required.
 */

const TEXAS = {
  minLon: -106.65,
  maxLon: -93.5,
  minLat: 25.84,
  maxLat: 36.5,
};

const BELLVILLE = { lat: 29.9502, lon: -96.2572, label: "Bellville" };

/** Rough Texas outline in lon/lat pairs (clockwise-ish). */
const TEXAS_OUTLINE: Array<[number, number]> = [
  [-106.65, 31.98],
  [-106.53, 31.78],
  [-105.87, 31.47],
  [-104.91, 30.87],
  [-104.69, 30.12],
  [-104.52, 29.67],
  [-103.32, 29.04],
  [-103.06, 28.98],
  [-102.0, 29.79],
  [-101.4, 29.72],
  [-100.96, 29.35],
  [-100.4, 28.4],
  [-99.51, 27.54],
  [-99.12, 26.4],
  [-98.2, 26.05],
  [-97.85, 25.95],
  [-97.4, 25.84],
  [-97.14, 26.0],
  [-97.4, 26.85],
  [-97.2, 27.6],
  [-96.9, 28.15],
  [-95.8, 28.75],
  [-94.8, 29.3],
  [-93.9, 29.75],
  [-93.84, 29.98],
  [-93.51, 31.15],
  [-93.55, 31.7],
  [-93.85, 31.95],
  [-94.04, 33.55],
  [-94.43, 33.64],
  [-95.15, 33.87],
  [-95.9, 33.96],
  [-96.75, 33.87],
  [-97.8, 33.98],
  [-98.5, 34.0],
  [-99.5, 34.38],
  [-100.0, 34.56],
  [-100.5, 34.6],
  [-101.4, 35.2],
  [-102.0, 36.1],
  [-103.0, 36.5],
  [-103.06, 32.0],
  [-106.53, 32.0],
  [-106.65, 31.98],
];

const WIDTH = 640;
const HEIGHT = 560;
const LON_SPAN = TEXAS.maxLon - TEXAS.minLon;
const LAT_SPAN = TEXAS.maxLat - TEXAS.minLat;
const MILES_PER_DEG_LAT = 69.0;
const MILES_PER_DEG_LON = Math.cos((BELLVILLE.lat * Math.PI) / 180) * 69.17;

function project(lon: number, lat: number) {
  const x = ((lon - TEXAS.minLon) / LON_SPAN) * WIDTH;
  const y = ((TEXAS.maxLat - lat) / LAT_SPAN) * HEIGHT;
  return { x, y };
}

function radiusAxes(miles: number) {
  const rx = (miles / MILES_PER_DEG_LON / LON_SPAN) * WIDTH;
  const ry = (miles / MILES_PER_DEG_LAT / LAT_SPAN) * HEIGHT;
  return { rx, ry };
}

const texasPath = TEXAS_OUTLINE.map(([lon, lat], i) => {
  const { x, y } = project(lon, lat);
  return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(" ") + " Z";

const bands = [
  { miles: 100, label: "100 mi — special projects", fill: "rgba(192, 197, 204, 0.12)", stroke: "rgba(192, 197, 204, 0.45)" },
  { miles: 50, label: "50 mi — primary area", fill: "rgba(192, 197, 204, 0.22)", stroke: "rgba(230, 231, 232, 0.75)" },
  { miles: 25, label: "25 mi", fill: "rgba(230, 231, 232, 0.18)", stroke: "rgba(230, 231, 232, 0.55)" },
];

const pin = project(BELLVILLE.lon, BELLVILLE.lat);

const nearby = [
  { name: "Houston", lat: 29.76, lon: -95.37 },
  { name: "Austin", lat: 30.27, lon: -97.74 },
  { name: "San Antonio", lat: 29.42, lon: -98.49 },
  { name: "Brenham", lat: 30.17, lon: -96.4 },
];

export function ServiceAreaMap() {
  return (
    <figure className="service-map">
      <svg
        className="service-map__svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Map of Texas showing Bellville and the TX Ropers Construction service area radius"
      >
        <defs>
          <clipPath id="texas-clip">
            <path d={texasPath} />
          </clipPath>
          <linearGradient id="texas-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a2230" />
            <stop offset="100%" stopColor="#0c1018" />
          </linearGradient>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill="#07090c" />

        <path d={texasPath} fill="url(#texas-fill)" stroke="#c0c5cc" strokeWidth="2.25" />

        <g clipPath="url(#texas-clip)">
          {bands.map((band) => {
            const { rx, ry } = radiusAxes(band.miles);
            return (
              <ellipse
                key={band.miles}
                cx={pin.x}
                cy={pin.y}
                rx={rx}
                ry={ry}
                fill={band.fill}
                stroke={band.stroke}
                strokeWidth="1.5"
                strokeDasharray={band.miles === 100 ? "5 4" : undefined}
              />
            );
          })}
        </g>

        {nearby.map((city) => {
          const p = project(city.lon, city.lat);
          return (
            <g key={city.name}>
              <circle cx={p.x} cy={p.y} r="2.5" fill="#6b7280" />
              <text
                x={p.x + 6}
                y={p.y + 3}
                fill="#9aa1ab"
                fontSize="11"
                fontFamily="Outfit, system-ui, sans-serif"
              >
                {city.name}
              </text>
            </g>
          );
        })}

        <g>
          <circle cx={pin.x} cy={pin.y} r="7" fill="#e6e7e8" />
          <circle cx={pin.x} cy={pin.y} r="3.5" fill="#050505" />
          <text
            x={pin.x + 12}
            y={pin.y - 8}
            fill="#e6e7e8"
            fontSize="14"
            fontWeight="700"
            fontFamily="Oswald, Arial Narrow, sans-serif"
            letterSpacing="0.06em"
          >
            BELLVILLE
          </text>
        </g>

        <text
          x="24"
          y="36"
          fill="#c0c5cc"
          fontSize="18"
          fontWeight="600"
          fontFamily="Oswald, Arial Narrow, sans-serif"
          letterSpacing="0.08em"
        >
          TEXAS
        </text>
      </svg>

      <figcaption className="service-map__legend">
        <ul>
          {bands.map((band) => (
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
      </figcaption>
    </figure>
  );
}
