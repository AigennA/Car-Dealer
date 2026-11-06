import { BUSINESS, schemaOpeningHours } from "@/config/business";
import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { Hanken_Grotesk, Sora, Unbounded } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RouteFocus from "@/components/layout/RouteFocus";
import { SITE } from "@/lib/site";

// Self-hosted via next/font: no render-blocking request to Google Fonts,
// automatic size-adjusted fallbacks (no layout shift), only latin subset.
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const logo = Unbounded({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-unbounded",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE.url}/`),
  title: {
    default: "Car Dealer | Kvalitetskontrollerade begagnade bilar",
    template: "%s | Car Dealer",
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: SITE.name,
    title: "Car Dealer | Kvalitetskontrollerade begagnade bilar",
    description: SITE.description,
    url: "./",
    images: [
      {
        url: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=1200&h=630&fit=crop&q=70&auto=format",
        width: 1200,
        height: 630,
        alt: "Bil i showroom hos Car Dealer",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: SITE.legalName,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    postalCode: SITE.address.postalCode,
    addressLocality: SITE.address.city,
    addressCountry: SITE.address.country,
  },
  openingHours: schemaOpeningHours(BUSINESS.showroomHours),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Car photos come from the Unsplash CDN — open the connection early so the
  // hero (LCP) image doesn't pay DNS + TCP + TLS after HTML parsing.
  preconnect("https://images.unsplash.com"); // no crossOrigin: <img> requests are non-CORS

  return (
    <html lang="sv" className={`${body.variable} ${display.variable} ${logo.variable}`}>
      <body className="font-sans antialiased">
        {/* WCAG 2.4.1 Bypass Blocks */}
        <a href="#main" className="skip-link">
          Hoppa till huvudinnehållet
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>
        <Footer />
        <RouteFocus />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
