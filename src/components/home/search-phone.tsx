import Image from "next/image";
import { Icon, Stars, type IconName } from "./icon";

type Row = {
  name: string;
  addr: string;
  stars: number;
  km: string;
} & ({ photo: string; tint: string } | { icon: IconName });

const ROWS: Row[] = [
  { name: "Plomberie Express", addr: "22 boulevard de la Liberté", stars: 5, km: "1,2 km", photo: "/home/plumber.webp", tint: "#f6e4dc" },
  { name: "Rénov’ Habitat", addr: "8 rue Victor Hugo", stars: 5, km: "2 km", photo: "/home/handyman.webp", tint: "#e5ecdc" },
  { name: "Nettoyage Éclat", addr: "15 rue des Écoles", stars: 4, km: "3 km", photo: "/home/cleaner.webp", tint: "#dceaf2" },
  { name: "Jardin de la Comtesse", addr: "5 rue des Rosiers", stars: 4, km: "4 km", icon: "leaf" },
  { name: "Peinture & Décoration Pro", addr: "30 chemin des Cèdres", stars: 5, km: "5 km", icon: "palette" },
  { name: "Électricité Martin", addr: "12 avenue des Fleurs", stars: 4, km: "6 km", icon: "flash" },
  { name: "Toitures du Centre", addr: "3 place de la Mairie", stars: 5, km: "7 km", icon: "home" },
];

/** Static mock of the app's "Près de chez toi" search screen. */
export function SearchPhone({ className }: { className?: string }) {
  return (
    <div
      className={`relative w-[300px] rounded-[56px] bg-[#0d0e12] p-3 shadow-[0_40px_90px_rgba(0,0,0,0.55),inset_0_0_0_2px_#3a3d46] sm:w-[340px] ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="relative h-[620px] overflow-hidden rounded-[44px] bg-white text-ink sm:h-[700px]">
        <div className="absolute left-1/2 top-[10px] z-10 h-[30px] w-[100px] -translate-x-1/2 rounded-full bg-black" />
        <div className="flex h-12 items-center justify-between px-8 pt-1 text-[15px] font-semibold">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="flex items-end gap-[2px]">
              {[4, 6, 8, 10].map((h) => (
                <span key={h} className="w-[3px] rounded-sm bg-ink" style={{ height: h }} />
              ))}
            </span>
            <span className="ml-1 h-[11px] w-[22px] rounded-[3px] border border-ink/70 p-[1.5px]">
              <span className="block h-full w-full rounded-[1.5px] bg-ink" />
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 pt-2">
          <Icon name="back" className="h-6 w-6" />
          <span className="text-[21px] font-bold">Près de chez toi</span>
        </div>

        <div className="mx-4 mt-3 flex h-11 items-center gap-2 rounded-[14px] bg-[#f3f3f5] px-3 text-[15px] text-[#9a9aa2]">
          <Icon name="search" className="h-[18px] w-[18px]" />
          <span className="flex-1">Rechercher un pro…</span>
          <Icon name="options" className="h-[18px] w-[18px] text-[#4a4d57]" />
        </div>

        <ul className="mt-2">
          {ROWS.map((r) => (
            <li key={r.name} className="flex items-center gap-3 px-4 py-[9px]">
              {"photo" in r ? (
                <div className="relative h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[16px]" style={{ backgroundColor: r.tint }}>
                  <Image src={r.photo} alt="" fill sizes="66px" className="object-cover" />
                </div>
              ) : (
                <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-teal to-pink text-white">
                  <Icon name={r.icon} className="h-7 w-7" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold">{r.name}</div>
                <div className="truncate text-[12px] text-[#9a9aa2]">{r.addr}</div>
                <div className="mt-1 flex items-center justify-between">
                  <Stars count={r.stars} className="text-[13px]" />
                  <span className="flex items-center gap-[2px] text-[12px] text-ink-secondary">
                    <Icon name="location" className="h-3 w-3" />
                    {r.km}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
}
