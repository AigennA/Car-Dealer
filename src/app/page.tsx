import Link from "next/link";
import Image from "next/image";
import { cars, getUniqueMakes, getUniqueFuels, getUniqueBodyTypes } from "@/lib/cars";
import CarCard from "@/components/ui/CarCard";

import MiniCreditCalculator from "@/components/MiniCreditCalculator";
import HeroCarStrip from "@/components/HeroCarStrip";

import SearchForm from "@/components/ui/SearchForm";
import {
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  CheckIcon,
} from "@/components/ui/icons";


export default function HomePage() {
  const featuredCars = cars.filter((car) => car.featured).slice(0, 3);
  const makes = getUniqueMakes();
  const fuels = getUniqueFuels();
  const bodyTypes = getUniqueBodyTypes();

  return (
    <>
      {/* ── Hero Section ── Bold azur mesh + grain + asymmetric layout ── */}
      <section className="hero-section hero-grain relative overflow-hidden flex items-center">

        {/* Decorative accent blob — top-left warm glow */}
        <div aria-hidden="true" className="hero-blob-accent hero-blob-accent-tl" />

        {/* Decorative azur blob — bottom-right depth layer */}
        <div aria-hidden="true" className="hero-blob-accent hero-blob-accent-br" />

        {/*
          Asymmetric grid: text takes ~55 % (col-span-7 of 12),
          image takes ~45 % (col-span-5) offset upward so it
          breaks the content-box boundary — the compositional
          tension that distinguishes it from a plain 50/50 split.
        */}
        <div className="max-w-7xl 2xl:max-w-400 mx-auto px-4 sm:px-6 md:px-10 2xl:px-16 pt-6 sm:pt-8 md:pt-10 pb-24 md:pb-28 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center">

            {/* ── Left / text column — 7 of 12 ── */}
            <div className="lg:col-span-7 text-white">

              {/* Eyebrow label */}
              <div className="hero-reveal hero-delay-0 inline-flex items-center gap-2 mb-6">
                <span className="hero-eyebrow-dash" aria-hidden="true" />
                <span className="hero-eyebrow-text">
                  Din nästa bil — hittar du här
                </span>
              </div>

              {/* Editorial H1: line 1 heavy display, line 2 lighter + accent word */}
              <h1 className="hero-reveal hero-delay-1 font-heading leading-none mb-6 select-none">
                {/* Line 1 — oversized, ultra-bold */}
                <span className="hero-h1-line hero-h1-line-1">HITTA DIN</span>
                {/* Line 2 — semibold, last word in accent color */}
                <span className="hero-h1-line hero-h1-line-2">
                  NÄSTA{" "}
                  <span className="hero-h1-accent">BIL</span>
                </span>
              </h1>

              {/* Lead paragraph */}
              <p className="hero-reveal hero-delay-2 hero-lead text-lg md:text-xl mb-6 max-w-md">
                Bläddra bland hundratals handplockade bilar och hitta den
                som passar dig — med trygg finansiering och garanti.
              </p>

              {/* CTA row */}
              <div className="hero-reveal hero-delay-3 flex flex-wrap items-center gap-4">
                {/* Primary CTA — accent filled */}
                <Link
                  href="/bilar"
                  className="hero-cta-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 cursor-pointer"
                >
                  <span>Utforska mer</span>
                  {/* Heroicons arrow-right (24px outline, strokeWidth 2) */}
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                {/* Secondary ghost CTA */}
                <Link
                  href="/bilar"
                  className="hero-cta-ghost inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium text-white border border-white/40 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                >
                  <span>Se alla bilar</span>
                </Link>
              </div>

              {/* Trust micro-stats */}
              <div className="hero-reveal hero-delay-4 hero-stats-row flex flex-wrap gap-6 mt-6 pt-6">
                {[
                  { value: "200+", label: "Bilar i lager" },
                  { value: "100%", label: "Garanterade" },
                  { value: "5★",   label: "Kundbetyg" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="hero-stat-value font-heading font-bold text-2xl">{value}</p>
                    <p className="hero-stat-label text-xs tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right / image column — 5 of 12, offset upward ── */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end lg:-mt-12">
              {/*
                .hero-image-frame adds two corner-bracket pseudo-elements:
                accent (top-right) + white (bottom-left) — composing the
                photo without clashing with the gradient background.
              */}
              <div className="hero-image-frame hero-reveal-scale hero-delay-img">
                {/* Subtle azur glow behind the car photo */}
                <div
                  aria-hidden="true"
                  className="hero-image-glow absolute inset-0 rounded-2xl"
                />
                <Image
                  src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&h=500&fit=crop"
                  alt="Premium bil"
                  width={800}
                  height={500}
                  className="hero-image w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
                  priority
                />
              </div>
            </div>

          </div>

          {/* Slowly auto-scrolling car thumbnail strip — fills the hero, gallery feel */}
          <div className="hero-reveal hero-delay-img mt-8 lg:mt-12">
            <HeroCarStrip />
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="relative z-20 -mt-16">
        <div className="max-w-6xl 2xl:max-w-350 mx-auto px-4 2xl:px-16">
          <SearchForm makes={makes} bodyTypes={bodyTypes} fuels={fuels} />
        </div>
      </section>

      {/* Featured Cars — moved above USP so cars appear right after the search bar */}
      <section className="bg-surface pt-8 pb-16">
        <div className="max-w-7xl 2xl:max-w-400 mx-auto px-4 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Utvalda bilar
            </h2>
            <p className="text-lg text-gray-600">
              Handplockade bilar från vårt lager
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/bilar"
              className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-dark transition"
            >
              Visa alla bilar →
            </Link>
          </div>
        </div>
      </section>

      {/* Mini Loan Calculator — right after "Visa alla bilar" (Featured), above USP */}
      <section className="bg-white py-16">
        <div className="max-w-7xl 2xl:max-w-400 mx-auto px-4 2xl:px-16">
          <div className="max-w-3xl mx-auto">
            <MiniCreditCalculator />
          </div>
        </div>
      </section>

      {/* USP Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl 2xl:max-w-400 mx-auto px-4 2xl:px-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <ShieldCheckIcon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">
                Kvalitetskontrollerade bilar
              </h3>
              <p className="text-gray-600">
                Alla bilar genomgår noggrann kontroll före försäljning
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <BanknotesIcon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">
                Finansiering & Leasing
              </h3>
              <p className="text-gray-600">
                Flexibla finansieringsmöjligheter anpassade efter dina behov
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <ArrowsRightLeftIcon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-navy mb-2">
                Inbyte & Garanti
              </h3>
              <p className="text-gray-600">
                Byt in din gamla bil och få trygg garanti på din nya
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="max-w-5xl 2xl:max-w-350 mx-auto px-4 2xl:px-16">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">
            Varför välja oss?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-primary shrink-0">
                <CheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-navy mb-1">
                  Transparent prissättning
                </h3>
                <p className="text-gray-600">
                  Inga dolda avgifter eller överraskningar
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary shrink-0">
                <CheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-navy mb-1">
                  Personlig service
                </h3>
                <p className="text-gray-600">
                  Vi guidar dig genom hela köpprocessen
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary shrink-0">
                <CheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-navy mb-1">
                  Flexibla lösningar
                </h3>
                <p className="text-gray-600">
                  Anpassade finansierings- och försäkringslösningar
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary shrink-0">
                <CheckIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-navy mb-1">
                  Trygg affär
                </h3>
                <p className="text-gray-600">
                  Garanti och ångerrätt på alla bilar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
