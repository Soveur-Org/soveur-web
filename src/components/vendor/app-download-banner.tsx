import { SOVEUR_MOBILE_STORE_BADGES } from "@/lib/soveur-app-download-links";

export function AppDownloadBanner() {
  return (
    <aside className="sticky top-0 z-40 bg-white/85 shadow-[0_1px_12px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 lg:h-[72px] lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src="/icon.png"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 rounded-[10px] border border-line lg:h-11 lg:w-11 lg:rounded-xl"
          />
          <div className="min-w-0 max-[359px]:hidden">
            <p className="text-[15px] font-bold leading-tight text-primary lg:text-lg">Soveur</p>
            <p className="hidden truncate text-xs text-ink-secondary sm:block lg:text-[13px]">
              Réservez et suivez vos rendez-vous depuis l&apos;app
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:gap-3">
          {SOVEUR_MOBILE_STORE_BADGES.map((store) => (
            <a
              key={store.imageSrc}
              href={store.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <img
                src={store.imageSrc}
                alt={store.label}
                className="h-8 w-auto object-contain lg:h-10"
                width={140}
                height={40}
              />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
