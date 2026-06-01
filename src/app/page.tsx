import Link from "next/link";
import Image from "next/image";
import { cars, getUniqueMakes, getUniqueFuels, getUniqueBodyTypes } from "@/lib/cars";
import CarCard from "@/components/ui/CarCard";

import MiniCreditCalculator from "@/components/MiniCreditCalculator";

import SearchForm from "@/components/ui/SearchForm";


export default function HomePage() {
  const featuredCars = cars.filter((car) => car.featured).slice(0, 3);
  const makes = getUniqueMakes();
  const fuels = getUniqueFuels();
  const bodyTypes = getUniqueBodyTypes();

  return (
    <>
      {/* Hero Section - Azur Blue Theme */}
      <section className="relative bg-gradient-to-br from-primary via-[#0099CC] to-[#00BFFF] min-h-[600px] flex items-center overflow-hidden">
        {/* Decorative Waves */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 right-0 w-full h-full" viewBox="0 0 1440 800">
            <path
              fill="white"
              d="M0,400 C320,300 640,500 960,400 C1120,350 1280,450 1440,400 L1440,0 L0,0 Z"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                HITTA DIN
                <br />
                NÄSTA BIL
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Låt oss hjälpa dig hitta din nästa bil!
              </p>
              <Link
                href="/bilar"
                className="inline-flex items-center gap-2 text-white font-medium hover:gap-4 transition-all"
              >
                <span>Utforska mer</span>
                <span>→</span>
              </Link>
            </div>

            {/* Right - Car Image */}
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&h=500&fit=crop"
                alt="Premium bil"
                width={800}
                height={500}
                className="w-full h-auto object-contain drop-shadow-2xl rounded-xl"
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="relative z-20 -mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <SearchForm makes={makes} bodyTypes={bodyTypes} fuels={fuels} />
        </div>
      </section>

      {/* USP Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-navy mb-2">
                Kvalitetskontrollerade bilar
              </h3>
              <p className="text-gray-600">
                Alla bilar genomgår noggrann kontroll före försäljning
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-navy mb-2">
                Finansiering & Leasing
              </h3>
              <p className="text-gray-600">
                Flexibla finansieringsmöjligheter anpassade efter dina behov
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔁</div>
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

      {/* Mini Loan Calculator */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <MiniCreditCalculator />
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-4">
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

      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-navy mb-8 text-center">
            Varför välja oss?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-primary text-2xl">✓</div>
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
              <div className="text-primary text-2xl">✓</div>
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
              <div className="text-primary text-2xl">✓</div>
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
              <div className="text-primary text-2xl">✓</div>
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
