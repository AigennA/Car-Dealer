"use client";

import { BUSINESS } from "@/config/business";
import { useId, useState } from "react";
import Link from "next/link";
import { setConsent, useConsent } from "@/lib/consent";
import { MapPinIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";
import { ROUTES } from "@/config/navigation";

const EMBED_SRC = BUSINESS.maps.embedUrl;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.city}`,
)}`;

/**
 * Click-to-load Google Maps. The iframe (which sets Google cookies) is only
 * rendered after the visitor actively agrees. The address and a directions
 * link are always available, so nobody needs the map to find us.
 */
export default function MapEmbed() {
  const consent = useConsent();
  const [sessionOnly, setSessionOnly] = useState(false);
  const [remember, setRemember] = useState(true);
  const id = useId();
  const show = consent.maps || sessionOnly;

  const accept = () => {
    if (remember) setConsent("maps", true);
    else setSessionOnly(true);
  };

  return (
    <div>
      <div className="rounded-lg overflow-hidden h-96 border border-gray-300 bg-surface">
        {show ? (
          <iframe
            src={EMBED_SRC}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Karta: ${SITE.address.street}, ${SITE.address.city}`}
          />
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center text-center gap-4 p-6"
            role="group"
            aria-labelledby={`${id}-title`}
            aria-describedby={`${id}-desc`}
          >
            <MapPinIcon className="w-10 h-10 text-primary" />
            <h3 id={`${id}-title`} className="text-lg font-semibold text-navy">
              Kartan är inte laddad
            </h3>
            <p id={`${id}-desc`} className="text-sm text-gray-700 max-w-md">
              Kartan visas via Google Maps. När den laddas skickas din IP-adress till Google och
              Google kan sätta cookies. Läs mer i vår{" "}
              <Link href={ROUTES.cookies} className="text-primary underline underline-offset-4">
                cookiepolicy
              </Link>
              .
            </p>
            <label className="inline-flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-5 h-5 accent-[var(--color-primary)]"
              />
              Kom ihåg mitt val
            </label>
            <button
              type="button"
              onClick={accept}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Visa karta (Google Maps)
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-700">
        <p>
          <strong className="text-navy">Adress:</strong> {SITE.address.street}, {SITE.address.postalCode}{" "}
          {SITE.address.city}
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href={DIRECTIONS}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium underline underline-offset-4"
          >
            Vägbeskrivning i Google Maps<span className="sr-only"> (öppnas i ny flik)</span>
          </a>
          {consent.maps && (
            <button
              type="button"
              onClick={() => setConsent("maps", false)}
              className="text-gray-700 underline underline-offset-4 hover:text-primary"
            >
              Dölj kartan och återkalla samtycke
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
