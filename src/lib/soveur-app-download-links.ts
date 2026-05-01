/** Liens et assets badges magasins — réutilisable (pages vendor, landing, footer, etc.). */

export const SOVEUR_IOS_APP_STORE_URL =
  "https://apps.apple.com/fr/app/soveur/id6757603883";

export const SOVEUR_ANDROID_PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.appsoveur&hl=fr";

export const SOVEUR_APP_STORE_BADGE_SRC = "/apple.webp" as const;
export const SOVEUR_PLAY_STORE_BADGE_SRC = "/android.webp" as const;

/** Données prêtes pour un bandeau ou une liste de liens (une seule source). */
export const SOVEUR_MOBILE_STORE_BADGES = [
  {
    href: SOVEUR_IOS_APP_STORE_URL,
    imageSrc: SOVEUR_APP_STORE_BADGE_SRC,
    label: "Télécharger sur l’App Store",
  },
  {
    href: SOVEUR_ANDROID_PLAY_STORE_URL,
    imageSrc: SOVEUR_PLAY_STORE_BADGE_SRC,
    label: "Télécharger sur Google Play",
  },
] as const;
