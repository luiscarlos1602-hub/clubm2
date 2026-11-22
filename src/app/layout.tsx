import type { Metadata } from "next";
import { IBM_Plex_Mono, Parkinsans } from "next/font/google";
import { Providers } from "@/composition/providers";
import { brand } from "@/shared/config/brand";
import "./globals.css";

/** Tipografía principal de la marca (ADR-009): títulos, texto, interfaz y cifras. */
const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

/** Códigos de proyecto (`M2-001`) y fechas de actualización. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${brand.name} · ${brand.descriptor}`, template: `%s · ${brand.name}` },
  description: brand.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${parkinsans.variable} ${plexMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
