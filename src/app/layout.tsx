import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  weight: ["400", "500", "600", "700"],
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Soveur",
  description: "Trouve un service ou développe ton activité, le tout depuis une seule app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${urbanist.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
