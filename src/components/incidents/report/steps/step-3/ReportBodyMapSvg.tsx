"use client";

import type {
  BodyPartId,
  BodyPartSideMap,
  BodySide,
} from "@/components/incidents/report/shared/report-incident-data";

export type ReportBodyMapView = "front" | "back";

type SvgLane = "left" | "right" | "center";

type BodyPath = Readonly<{
  d: string;
  part: BodyPartId;
  lane?: SvgLane;
  /** Front-only face accents (eyes / mouth). */
  decorative?: boolean;
  opacity?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: "round" | "butt" | "square";
}>;

const STROKE = 0.888902;

/* Every colour below is rendered onto an SVG *presentation attribute*
   (`fill=`, `stroke=`), where `var()` is not valid - the browser drops the
   attribute and the shape falls back to the SVG default black. They stay
   literal hex. */
const IDLE_FILL = "#8892A3";
const IDLE_FILL_OPACITY = 0.08;
const IDLE_STROKE = "#0F172A";
const IDLE_STROKE_OPACITY = 0.14;
const ACTIVE_FILL = "#0891A6";
const ACTIVE_STROKE = "#056E7E";

/**
 * Shared body-map paths. Front and back differ mainly by horizontal mirroring
 * and front-only face details — matching the provided SVGs.
 */
const FRONT_PATHS: readonly BodyPath[] = [
  {
    part: "head-face",
    lane: "center",
    d: "M66.29 32.8893C72.181 32.8893 76.9566 26.9198 76.9566 19.556C76.9566 12.1922 72.181 6.22266 66.29 6.22266C60.3989 6.22266 55.6233 12.1922 55.6233 19.556C55.6233 26.9198 60.3989 32.8893 66.29 32.8893Z",
  },
  {
    part: "head-face",
    lane: "center",
    decorative: true,
    opacity: 0.55,
    fill: "#566072",
    d: "M62.7344 18.7563C63.2744 18.7563 63.7121 18.3186 63.7121 17.7786C63.7121 17.2385 63.2744 16.8008 62.7344 16.8008C62.1944 16.8008 61.7566 17.2385 61.7566 17.7786C61.7566 18.3186 62.1944 18.7563 62.7344 18.7563Z",
  },
  {
    part: "head-face",
    lane: "center",
    decorative: true,
    opacity: 0.55,
    fill: "#566072",
    d: "M69.8455 18.7563C70.3855 18.7563 70.8232 18.3186 70.8232 17.7786C70.8232 17.2385 70.3855 16.8008 69.8455 16.8008C69.3054 16.8008 68.8677 17.2385 68.8677 17.7786C68.8677 18.3186 69.3054 18.7563 69.8455 18.7563Z",
  },
  {
    part: "head-face",
    lane: "center",
    decorative: true,
    opacity: 0.5,
    fill: "none",
    stroke: "#8892A3",
    strokeWidth: 0.622232,
    strokeLinecap: "round",
    d: "M62.7344 24C65.1047 25.1852 67.4751 25.1852 69.8455 24",
  },
  {
    part: "neck",
    lane: "center",
    d: "M61.8455 32.8887H70.7343V40.8887H61.8455V32.8887Z",
  },
  {
    part: "chest-shoulders",
    lane: "center",
    d: "M41.4007 40.8887C37.8452 40.8887 36.0674 43.5553 36.0674 48.8887L39.6229 74.6665H92.9563L96.5118 48.8887C96.5118 43.5553 94.7341 40.8887 91.1785 40.8887H41.4007Z",
  },
  {
    part: "abdomen",
    lane: "center",
    d: "M39.623 74.668H92.9564L89.4008 103.112H43.1786L39.623 74.668Z",
  },
  {
    part: "hip-pelvis",
    lane: "center",
    d: "M43.1785 103.113H89.4007L85.8451 128.002H46.734L43.1785 103.113Z",
  },
  {
    part: "upper-arm",
    lane: "left",
    d: "M36.0672 48.8887L30.7338 53.3331L28.9561 83.5553H36.0672V48.8887Z",
  },
  {
    part: "forearm",
    lane: "left",
    d: "M28.9559 83.5566H36.0671L34.2893 120.89L25.4004 122.668L28.9559 83.5566Z",
  },
  {
    part: "hand-wrist",
    lane: "left",
    d: "M27.1781 124.447C25.4004 126.225 24.5115 128.595 24.5115 131.558V138.669C24.5115 142.225 25.993 144.595 28.9559 145.781H32.5115C34.8818 145.781 36.067 144.003 36.067 140.447V126.225L27.1781 124.447Z",
  },
  {
    part: "upper-arm",
    lane: "right",
    d: "M96.5127 48.8887L101.846 53.3331L103.624 83.5553H96.5127V48.8887Z",
  },
  {
    part: "forearm",
    lane: "right",
    d: "M103.624 83.5566H96.5127L98.2905 120.89L107.179 122.668L103.624 83.5566Z",
  },
  {
    part: "hand-wrist",
    lane: "right",
    d: "M105.402 124.447C107.179 126.225 108.068 128.595 108.068 131.558V138.669C108.068 142.225 106.587 144.595 103.624 145.781H100.068C97.6979 145.781 96.5127 144.003 96.5127 140.447V126.225L105.402 124.447Z",
  },
  {
    part: "thigh",
    lane: "left",
    d: "M46.7341 128.002H64.5119L62.7341 181.335H50.2897L46.7341 128.002Z",
  },
  {
    part: "lower-leg",
    lane: "left",
    d: "M50.2898 181.336H62.7342L60.9565 222.225H52.0676L50.2898 181.336Z",
  },
  {
    part: "foot-ankle",
    lane: "left",
    d: "M50.2897 222.225H60.9564L62.7341 232.891C62.7341 235.262 61.5489 236.447 59.1786 236.447H50.2897C47.9193 236.447 46.7341 235.262 46.7341 232.891L50.2897 222.225Z",
  },
  {
    part: "thigh",
    lane: "right",
    d: "M68.0679 128.002H85.8456L82.2901 181.335H69.8456L68.0679 128.002Z",
  },
  {
    part: "lower-leg",
    lane: "right",
    d: "M69.8457 181.336H82.2901L80.5124 222.225H71.6235L69.8457 181.336Z",
  },
  {
    part: "foot-ankle",
    lane: "right",
    d: "M71.6235 222.225H82.2901L85.8457 232.891C85.8457 235.262 84.6605 236.447 82.2901 236.447H73.4013C71.0309 236.447 69.8457 235.262 69.8457 232.891L71.6235 222.225Z",
  },
];

const BACK_PATHS: readonly BodyPath[] = [
  {
    part: "head-face",
    lane: "center",
    d: "M66.2901 32.8893C60.3991 32.8893 55.6235 26.9198 55.6235 19.556C55.6235 12.1922 60.3991 6.22266 66.2901 6.22266C72.1812 6.22266 76.9568 12.1922 76.9568 19.556C76.9568 26.9198 72.1812 32.8893 66.2901 32.8893Z",
  },
  {
    part: "neck",
    lane: "center",
    d: "M70.7346 32.8887H61.8457V40.8887H70.7346V32.8887Z",
  },
  {
    part: "upper-back",
    lane: "center",
    d: "M91.1794 40.8887C94.7349 40.8887 96.5127 43.5553 96.5127 48.8887L92.9571 74.6665H39.6238L36.0682 48.8887C36.0682 43.5553 37.846 40.8887 41.4016 40.8887H91.1794Z",
  },
  {
    part: "mid-back",
    lane: "center",
    d: "M92.957 74.668H39.6237L43.1793 103.112H89.4015L92.957 74.668Z",
  },
  {
    part: "lower-back",
    lane: "center",
    d: "M89.4016 103.113H43.1794L46.7349 128.002H85.8461L89.4016 103.113Z",
  },
  {
    part: "upper-arm",
    lane: "right",
    d: "M96.5129 48.8887L101.846 53.3331L103.624 83.5553H96.5129V48.8887Z",
  },
  {
    part: "forearm",
    lane: "right",
    d: "M103.624 83.5566H96.513L98.2908 120.89L107.18 122.668L103.624 83.5566Z",
  },
  {
    part: "hand-wrist",
    lane: "right",
    d: "M105.402 124.447C107.18 126.225 108.069 128.595 108.069 131.558V138.669C108.069 142.225 106.587 144.595 103.624 145.781H100.069C97.6982 145.781 96.513 144.003 96.513 140.447V126.225L105.402 124.447Z",
  },
  {
    part: "upper-arm",
    lane: "left",
    d: "M36.0674 48.8887L30.734 53.3331L28.9563 83.5553H36.0674V48.8887Z",
  },
  {
    part: "forearm",
    lane: "left",
    d: "M28.9563 83.5566H36.0674L34.2896 120.89L25.4007 122.668L28.9563 83.5566Z",
  },
  {
    part: "hand-wrist",
    lane: "left",
    d: "M27.1785 124.447C25.4007 126.225 24.5118 128.595 24.5118 131.558V138.669C24.5118 142.225 25.9933 144.595 28.9563 145.781H32.5118C34.8822 145.781 36.0674 144.003 36.0674 140.447V126.225L27.1785 124.447Z",
  },
  {
    part: "thigh",
    lane: "right",
    d: "M85.8459 128.002H68.0682L69.8459 181.335H82.2904L85.8459 128.002Z",
  },
  {
    part: "lower-leg",
    lane: "right",
    d: "M82.2903 181.336H69.8458L71.6236 222.225H80.5125L82.2903 181.336Z",
  },
  {
    part: "foot-ankle",
    lane: "right",
    d: "M82.2904 222.225H71.6237L69.8459 232.891C69.8459 235.262 71.0311 236.447 73.4015 236.447H82.2904C84.6608 236.447 85.8459 235.262 85.8459 232.891L82.2904 222.225Z",
  },
  {
    part: "thigh",
    lane: "left",
    d: "M64.5122 128.002H46.7344L50.29 181.335H62.7344L64.5122 128.002Z",
  },
  {
    part: "lower-leg",
    lane: "left",
    d: "M62.7344 181.336H50.2899L52.0677 222.225H60.9566L62.7344 181.336Z",
  },
  {
    part: "foot-ankle",
    lane: "left",
    d: "M60.9566 222.225H50.2899L46.7344 232.891C46.7344 235.262 47.9196 236.447 50.2899 236.447H59.1788C61.5492 236.447 62.7344 235.262 62.7344 232.891L60.9566 222.225Z",
  },
];

/**
 * Front SVG left lane = Left. Back figure is mirrored, so SVG right lane = Left
 * (same physical side as the provided default teal hands).
 */
function laneToBodySide(
  view: ReportBodyMapView,
  lane: SvgLane,
): BodySide | undefined {
  if (lane === "center") return undefined;
  if (view === "front") {
    return lane === "left" ? "Left" : "Right";
  }
  return lane === "right" ? "Left" : "Right";
}

function isPathSelected(
  path: BodyPath,
  view: ReportBodyMapView,
  selectedParts: readonly BodyPartId[],
  bodyPartSides: BodyPartSideMap,
  fallbackSide: BodySide,
) {
  if (path.decorative) return false;
  if (!selectedParts.includes(path.part)) return false;
  if (!path.lane || path.lane === "center") return true;
  const pathSide = laneToBodySide(view, path.lane);
  const stored = bodyPartSides[path.part] ?? fallbackSide;
  return stored === "Both" || stored === pathSide;
}

export type ReportBodyMapSvgProps = Readonly<{
  view: ReportBodyMapView;
  selectedParts: readonly BodyPartId[];
  bodyPartSides: BodyPartSideMap;
  bodySide: BodySide;
  onSelectPart: (part: BodyPartId, side?: BodySide) => void;
  className?: string;
}>;

export function ReportBodyMapSvg(props: Readonly<ReportBodyMapSvgProps>) {
  const {
    view,
    selectedParts,
    bodyPartSides,
    bodySide,
    onSelectPart,
    className = "",
  } = props;

  const paths = view === "front" ? FRONT_PATHS : BACK_PATHS;

  return (
    <svg
      viewBox="0 0 133 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={["block aspect-[133/240] h-auto w-full", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={view === "front" ? "Front body map" : "Back body map"}
      role="img"
    >
      {paths.map((path, index) => {
        const selected = isPathSelected(
          path,
          view,
          selectedParts,
          bodyPartSides,
          bodySide,
        );

        if (path.decorative) {
          return (
            <path
              key={`${view}-deco-${index}`}
              d={path.d}
              opacity={path.opacity}
              fill={path.fill ?? "none"}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              strokeLinecap={path.strokeLinecap}
              pointerEvents="none"
            />
          );
        }

        return (
          <path
            key={`${view}-${path.part}-${path.lane ?? "c"}-${index}`}
            d={path.d}
            fill={selected ? ACTIVE_FILL : IDLE_FILL}
            fillOpacity={selected ? 1 : IDLE_FILL_OPACITY}
            stroke={selected ? ACTIVE_STROKE : IDLE_STROKE}
            strokeOpacity={selected ? 1 : IDLE_STROKE_OPACITY}
            strokeWidth={STROKE}
            strokeLinejoin="round"
            className="cursor-pointer transition-[fill,stroke,fill-opacity] duration-150 hover:brightness-[0.97]"
            onClick={() => {
              const side = path.lane
                ? laneToBodySide(view, path.lane)
                : undefined;
              onSelectPart(path.part, side);
            }}
          />
        );
      })}
    </svg>
  );
}
