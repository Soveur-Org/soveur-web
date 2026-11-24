import {
  SOVEUR_ANDROID_PLAY_STORE_URL,
  SOVEUR_IOS_APP_STORE_URL,
} from "@/lib/soveur-app-download-links";

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <defs>
        <clipPath id="soveur-play-clip">
          <path d="M4.4 1.2C3.7.8 3 1.3 3 2.1v19.8c0 .8.7 1.3 1.4.9l16.5-9.4c.7-.4.7-1.4 0-1.8z" />
        </clipPath>
      </defs>
      <g clipPath="url(#soveur-play-clip)">
        <polygon points="0,-2 13.5,12 0,26" fill="#4285F4" />
        <polygon points="0,-2 13.5,12 20,6.4 20,-2" fill="#34A853" />
        <polygon points="13.5,12 20,6.4 26,6.4 26,17.6 20,17.6" fill="#FBBC04" />
        <polygon points="0,26 13.5,12 20,17.6 20,26" fill="#EA4335" />
      </g>
    </svg>
  );
}

const STORES = [
  {
    href: SOVEUR_IOS_APP_STORE_URL,
    label: "Télécharger Soveur sur l’App Store",
    kicker: "Télécharger dans",
    name: "l’App Store",
    logo: <AppleLogo className="h-7 w-7 -translate-y-px" />,
  },
  {
    href: SOVEUR_ANDROID_PLAY_STORE_URL,
    label: "Télécharger Soveur sur Google Play",
    kicker: "Disponible sur",
    name: "Google Play",
    logo: <GooglePlayLogo className="h-6 w-6" />,
  },
];

export function StoreBadges({ className }: { className?: string }) {
  return (
    <div className={`grid w-full max-w-[360px] grid-cols-2 gap-3 sm:flex sm:w-auto sm:max-w-none sm:items-center ${className ?? ""}`}>
      {STORES.map((store) => (
        <a
          key={store.href}
          href={store.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={store.label}
          className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-black px-3 sm:min-w-[176px] sm:justify-start sm:gap-3 sm:pl-4 sm:pr-5 text-white ring-1 ring-white/[0.08] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)] transition hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-[0_18px_40px_-12px_rgba(229,0,126,0.45)] active:translate-y-0"
        >
          <span className="flex w-7 shrink-0 justify-center">{store.logo}</span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-[11px] font-medium text-white/65">{store.kicker}</span>
            <span className="mt-1 whitespace-nowrap text-[16px] font-bold sm:text-[19px] tracking-[-0.01em]">{store.name}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
