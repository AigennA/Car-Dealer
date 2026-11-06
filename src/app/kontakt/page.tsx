"use client";

import HoursList from "@/components/ui/HoursList";
import { BUSINESS } from "@/config/business";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ContactForm from "@/components/contact/ContactForm";
import MapEmbed from "@/components/MapEmbed";
import AdvisorCard from "@/components/people/AdvisorCard";
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";
import { ROUTES } from "@/config/navigation";

/** Pre-fills car + subject when arriving from a car page (?bil=slug&amne=provkorning). */
function ContactFormWithParams() {
  const params = useSearchParams();
  return (
    <ContactForm
      key={params.toString()}
      carSlug={params.get("bil") ?? ""}
      subject={params.get("amne") ?? ""}
    />
  );
}

export default function KontaktPage() {
  return (
    <section className="bg-surface min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
            Kontakta oss
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Vi finns här för att hjälpa dig hitta din drömvagn. Kontakta oss idag!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-navy mb-4">Skicka ett meddelande</h2>

            <Suspense fallback={<ContactForm />}>
              <ContactFormWithParams />
            </Suspense>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <AdvisorCard variant="compact" headingLevel="h2" />
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-navy mb-6">Kontaktinformation</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Telefon</h3>
                    <p><a href={SITE.phoneHref} className="text-primary font-medium underline underline-offset-4">{SITE.phone}</a></p>
                    <p className="text-sm text-gray-700">{SITE.openingHours}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">E-post</h3>
                    <p><a href={`mailto:${SITE.email}`} className="text-primary font-medium underline underline-offset-4">{SITE.email}</a></p>
                    <p className="text-sm text-gray-700">Vi svarar inom 24 timmar</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Besöksadress</h3>
                    <p className="text-gray-700">{SITE.address.street}</p>
                    <p className="text-gray-700">{SITE.address.postalCode} {SITE.address.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Öppettider</h3>
                    <HoursList week={BUSINESS.showroomHours} />
                    <p className="text-gray-700">Söndag: Stängt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-linear-to-br from-primary-dark to-primary rounded-xl p-8 text-white">
              <h2 className="text-xl font-bold mb-4">Vill du veta mer?</h2>
              <p className="mb-6">
                Besök vår showroom och låt våra experter guida dig till rätt bil
              </p>
              <Link
                href={ROUTES.cars}
                className="inline-block bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Se vårt lager
              </Link>
            </div>
          </div>
        </div>

        {/* Map Section — Google Maps only loads after consent */}
        <section aria-labelledby="map-heading" className="bg-white rounded-xl p-8 shadow-sm">
          <h2 id="map-heading" className="text-2xl font-bold text-navy mb-6">Hitta till oss</h2>
          <MapEmbed />
          <p className="text-sm text-gray-700 mt-4">
            Vi ligger centralt i {SITE.address.city} med bra kommunikationer. Kundparkering finns utanför
            entrén. Välkommen till vår showroom!
          </p>
        </section>
      </div>
    </section>
  );
}
