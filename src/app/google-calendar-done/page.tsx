import type { Metadata } from "next";
import RedirectToApp from "./RedirectToApp";

export const metadata: Metadata = {
  title: "Redirection vers l'app",
  robots: { index: false, follow: false },
};

export default function GoogleCalendarDonePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6">
      <RedirectToApp target="soveur://vendor/account" />
      <a
        href="https://soveur.com"
        className="inline-flex items-center justify-center rounded-xl border border-[#e6e8ef] bg-[#1f2436] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a3045]"
      >
        Retourner à soveur.com
      </a>
    </main>
  );
}
