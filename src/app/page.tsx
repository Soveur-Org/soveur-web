import Image from "next/image";
import type { Metadata } from "next";
import { DownloadButton } from "@/components/home/download-button";
import { Icon, Stars, type IconName } from "@/components/home/icon";
import { IconPattern } from "@/components/home/icon-pattern";
import { SearchPhone } from "@/components/home/search-phone";
import { StoreBadges } from "@/components/home/store-badges";

export const metadata: Metadata = {
  title: "Soveur – Le bon pro, près de chez toi",
  description:
    "Plombiers, électriciens, peintres, paysagistes… Trouve un pro près de chez toi, compare les avis, réserve ton créneau et paie en toute sécurité avec l’app Soveur.",
  openGraph: {
    title: "Soveur – Le bon pro, près de chez toi",
    description: "Compare les avis, choisis ton créneau et paie en toute sécurité.",
    images: ["/home/pros.webp"],
    locale: "fr_FR",
    type: "website",
  },
};

const TRADES: { label: string; icon: IconName; color: string }[] = [
  { label: "Plombier", icon: "water", color: "#7fc4bc" },
  { label: "Électricien", icon: "flash", color: "#ffb800" },
  { label: "Peintre", icon: "palette", color: "#e46fb0" },
  { label: "Paysagiste", icon: "leaf", color: "#7fd49a" },
];

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "location",
    title: "Des pros autour de toi",
    text: "Plombiers, électriciens, peintres, paysagistes… trouve en un instant les prestataires près de chez toi.",
  },
  {
    icon: "star",
    title: "Des avis clients vérifiés",
    text: "Consulte les profils, compare les prix et découvre les avis avant de réserver.",
  },
  {
    icon: "calendar",
    title: "Réserve ou demande un devis",
    text: "Choisis ton service et ta date en quelques clics, ou décris ton besoin pour recevoir un devis.",
  },
  {
    icon: "shield",
    title: "Paiement sécurisé",
    text: "Paie directement dans l’app, avec reçus en ligne et suivi simplifié.",
  },
];

const PRO_POINTS = [
  "Ta vitrine en ligne avec tes services, tes photos et tes avis",
  "Des demandes de devis et des réservations de clients proches",
  "Tes paiements encaissés en toute sécurité",
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-night text-white">
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <ForPros />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5">
      <Image src="/icon.png" alt="" width={36} height={36} className="h-9 w-9 rounded-[10px]" priority />
      <span className="text-xl font-bold tracking-tight">Soveur</span>
    </a>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-night/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-[15px] font-medium text-white/70 md:flex">
          <a href="#fonctionnalites" className="transition hover:text-white">Fonctionnalités</a>
          <a href="#pros" className="transition hover:text-white">Pour les pros</a>
        </nav>
        <DownloadButton className="h-10 px-4 text-sm sm:px-5" />
      </div>
    </header>
  );
}

function Glows({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className ?? ""}`} aria-hidden="true">
      <div className="absolute -left-40 top-0 h-[700px] w-[700px] rounded-full bg-teal opacity-20 blur-[140px]" />
      <div className="absolute -right-40 top-32 h-[700px] w-[700px] rounded-full bg-pink opacity-20 blur-[140px]" />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      <Glows />
      <IconPattern className="text-white opacity-[0.045] [mask-image:linear-gradient(to_bottom,#000_60%,transparent)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-sm font-medium text-white/80">
            <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_10px_#7fc4bc]" />
            Disponible sur iPhone et Android
          </span>

          <h1 className="text-[44px] font-bold leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-[72px]">
            Le <span className="grad-text">bon pro</span>,
            <br />
            près de chez toi.
          </h1>

          <ul className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
            {TRADES.map((t) => (
              <li
                key={t.label}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.08] px-3.5 py-2 text-[15px] font-semibold"
              >
                <Icon name={t.icon} className="h-4 w-4" style={{ color: t.color }} />
                {t.label}
              </li>
            ))}
          </ul>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-white/70 sm:text-xl">
            Compare les avis, choisis ton créneau et paie en toute sécurité. Tout se passe dans l’app.
          </p>

          <StoreBadges className="mt-9 justify-center lg:justify-start" />
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[1/1.08] w-full max-w-[340px] sm:max-w-[480px] lg:max-w-[520px]">
      {/* Halo + ring */}
      <div
        className="absolute left-1/2 top-[45%] aspect-square w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-[70px]"
        style={{ background: "conic-gradient(from 200deg, #7fc4bc, #c58bb4, #e5007e, #c58bb4, #7fc4bc)" }}
        aria-hidden="true"
      />
      <div
        className="absolute left-[7%] right-[7%] top-[3%] aspect-square rounded-full border-[5px] border-transparent"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #2c3040 0%, #20232c 70%) padding-box, linear-gradient(135deg, #7fc4bc, #e5007e) border-box",
        }}
        aria-hidden="true"
      />

      {/* The three pros, faded into the page at the bottom */}
      <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_70%,transparent_97%)]">
        <Image
          src="/home/pros.webp"
          alt="Un plombier, un artisan et une agente d’entretien souriants"
          width={1200}
          height={1484}
          priority
          sizes="(min-width: 1024px) 520px, (min-width: 640px) 480px, 340px"
          className="absolute left-0 top-[12%] w-full"
        />
      </div>

      {/* Floating cards */}
      <div className="float-card absolute -left-3 top-[47%] flex rotate-[-4deg] items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:-left-10 sm:gap-4 sm:rounded-3xl sm:p-3 sm:pr-6 lg:-left-20">
        <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-[#f3e3ec] sm:h-14 sm:w-14 sm:rounded-2xl">
          <Image src="/home/plumber.webp" alt="" fill sizes="56px" className="object-cover" />
        </div>
        <div>
          <div className="text-sm font-bold sm:text-lg">Plomberie Express</div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-secondary sm:text-sm">
            <Stars count={5} className="text-[11px] sm:text-[13px]" />
            <span className="flex items-center gap-0.5">
              <Icon name="location" className="h-3 w-3" />2 km
            </span>
          </div>
        </div>
      </div>

      <div
        className="float-card absolute -right-3 top-[70%] flex rotate-[4deg] items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.45)] [animation-delay:-2s] sm:-right-6 sm:gap-4 sm:rounded-3xl sm:p-3 sm:pr-6 lg:-right-10"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-pink text-white sm:h-14 sm:w-14 sm:rounded-2xl">
          <Icon name="shield" className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div>
          <div className="text-sm font-bold sm:text-lg">Paiement sécurisé</div>
          <div className="text-xs text-ink-secondary sm:text-sm">Avis clients vérifiés</div>
        </div>
      </div>

      <div className="float-card absolute left-[1%] top-[13%] inline-flex rotate-[3deg] items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-[0_16px_40px_rgba(0,0,0,0.4)] [animation-delay:-4s] sm:text-base">
        <Icon name="flash" className="h-4 w-4 text-pink" />
        Électricien
      </div>

      <div className="float-card absolute right-[2%] top-[6%] inline-flex rotate-[-3deg] items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-[0_16px_40px_rgba(0,0,0,0.4)] [animation-delay:-3s] sm:text-base">
        <Icon name="palette" className="h-4 w-4 text-[#2e9e8f]" />
        Peintre
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text?: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal">{eyebrow}</p>
      <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-0.02em] sm:text-5xl">{title}</h2>
      {text && <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/65">{text}</p>}
    </div>
  );
}

function Features() {
  return (
    <section id="fonctionnalites" className="relative scroll-mt-20 border-t border-white/[0.06]">
      <div
        className="pointer-events-none absolute left-1/4 top-1/3 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "conic-gradient(from 210deg, #7fc4bc, #c58bb4, #e5007e, #c58bb4, #7fc4bc)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[auto_1fr] lg:gap-20 lg:px-8 lg:py-28">
        <SearchPhone className="order-2 mx-auto lg:order-1" />

        <div className="order-1 lg:order-2">
          <SectionTitle
            eyebrow="L’app"
            title={
              <>
                Trouver un pro,
                <br />
                <span className="grad-text">en quelques secondes.</span>
              </>
            }
            text="Soveur réunit les prestataires de ton quartier dans une seule app, du premier contact jusqu’au paiement."
          />

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 transition hover:border-white/15 hover:bg-white/[0.06]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal to-pink text-white">
                  <Icon name={f.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 leading-relaxed text-white/60">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ForPros() {
  return (
    <section id="pros" className="relative scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-white/[0.08] bg-gradient-to-br from-[#232631] to-[#1d1f27] px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-pink opacity-25 blur-[110px]" aria-hidden="true" />
          <IconPattern className="text-white opacity-[0.035]" />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionTitle
                eyebrow="Pour les pros"
                title={
                  <>
                    Tu es pro ?
                    <br />
                    <span className="grad-text">Développe ton activité.</span>
                  </>
                }
                text="Publie tes services et reçois des demandes de clients près de chez toi, directement depuis ton téléphone."
              />
              <ul className="mt-8 space-y-3.5">
                {PRO_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-white/80">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                      <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <DownloadButton label="Créer mon profil pro" className="mt-9 h-12 px-6" />
            </div>

            <ProNotifications />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProNotifications() {
  const items: { icon: IconName; title: string; text: string; time: string }[] = [
    { icon: "quote", title: "Nouvelle demande de devis", text: "Rénovation salle de bain · 1,8 km", time: "maintenant" },
    { icon: "calendar", title: "Réservation confirmée", text: "Jeudi 14:00 · Réparation fuite", time: "5 min" },
    { icon: "card", title: "Paiement reçu", text: "Acompte encaissé pour ton devis", time: "1 h" },
  ];
  return (
    <ul className="mx-auto w-full max-w-sm space-y-3" aria-hidden="true">
      {items.map((n, i) => (
        <li
          key={n.title}
          className="flex items-center gap-3.5 rounded-[22px] bg-white/95 p-3.5 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur"
          style={{ marginLeft: `${i * 18}px`, marginRight: `${(2 - i) * 18}px` }}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-teal to-pink text-white">
            <Icon name={n.icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[15px] font-bold">{n.title}</span>
              <span className="shrink-0 text-xs text-ink-tertiary">{n.time}</span>
            </div>
            <div className="truncate text-sm text-ink-secondary">{n.text}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FinalCta() {
  return (
    <section id="telecharger" className="relative scroll-mt-20 overflow-hidden">
      <Glows className="[mask-image:linear-gradient(to_bottom,transparent,#000_35%,#000_65%,transparent)]" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:py-32">
        <div className="rounded-[28px] bg-gradient-to-br from-teal to-pink p-[3px] shadow-[0_20px_60px_-10px_rgba(229,0,126,0.5)]">
          <Image src="/icon.png" alt="Icône de l’app Soveur" width={96} height={96} className="h-24 w-24 rounded-[25px]" />
        </div>
        <h2 className="mt-8 text-[38px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
          Télécharge <span className="grad-text">Soveur</span>
        </h2>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-white/65">
          Trouve un service ou développe ton activité, le tout depuis une seule app.
        </p>
        <StoreBadges className="mt-9 justify-center" />
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-white/50 sm:flex-row sm:px-6 lg:px-8">
        <Logo />
        <p>© {new Date().getFullYear()} Soveur. Tous droits réservés.</p>
      </div>
    </footer>
  );
}
