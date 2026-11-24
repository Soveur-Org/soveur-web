"use client";

import { useSyncExternalStore } from "react";
import {
  SOVEUR_ANDROID_PLAY_STORE_URL,
  SOVEUR_IOS_APP_STORE_URL,
} from "@/lib/soveur-app-download-links";
import { Icon } from "./icon";

const FALLBACK_HREF = "#telecharger";

function storeHrefForDevice(): string {
  const ua = navigator.userAgent;
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (isIOS) return SOVEUR_IOS_APP_STORE_URL;
  if (/Android/i.test(ua)) return SOVEUR_ANDROID_PLAY_STORE_URL;
  return FALLBACK_HREF;
}

const noopSubscribe = () => () => {};

/**
 * Opens the right store directly on phones; on desktop, scrolls to the badges.
 */
export function DownloadButton({
  label = "Télécharger l’app",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const href = useSyncExternalStore(noopSubscribe, storeHrefForDevice, () => FALLBACK_HREF);
  const external = href !== FALLBACK_HREF;

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal via-orchid to-pink font-semibold text-white shadow-[0_10px_30px_-8px_rgba(229,0,126,0.6)] transition hover:brightness-110 active:scale-[0.98] ${className ?? ""}`}
    >
      <Icon name="download" className="h-[1.1em] w-[1.1em]" />
      {label}
    </a>
  );
}
