import { Icon, type IconName } from "./icon";

const TILE = 220;
const ITEMS: { name: IconName; x: number; y: number; r: number }[] = [
  { name: "wrench", x: 20, y: 24, r: -18 },
  { name: "hammer", x: 128, y: 40, r: 14 },
  { name: "flash", x: 72, y: 128, r: -8 },
  { name: "palette", x: 178, y: 150, r: 20 },
  { name: "leaf", x: 12, y: 176, r: 10 },
  { name: "water", x: 120, y: 196, r: -14 },
  { name: "brush", x: 186, y: 86, r: -24 },
  { name: "home", x: 58, y: 78, r: 6 },
];

/** Faint trade-icon wallpaper, as in the App Store artwork. */
export function IconPattern({ className }: { className?: string }) {
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`} aria-hidden="true">
      <defs>
        <pattern id="soveur-trade-pattern" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
          {ITEMS.map((it) => (
            <g key={it.name} transform={`translate(${it.x} ${it.y}) rotate(${it.r} 16 16)`}>
              <Icon name={it.name} width={32} height={32} x={0} y={0} />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#soveur-trade-pattern)" />
    </svg>
  );
}
