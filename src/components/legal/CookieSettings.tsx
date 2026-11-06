"use client";

import { useState } from "react";
import { setConsent, useConsent, CONSENT_KEY } from "@/lib/consent";
import { STORAGE_KEY } from "@/lib/clientStorage";

/** Lets visitors give or withdraw consent and clear locally stored data. */
export default function CookieSettings() {
  const consent = useConsent();
  const [status, setStatus] = useState("");

  const toggleMaps = () => {
    const next = !consent.maps;
    setConsent("maps", next);
    setStatus(next ? "Google Maps är nu tillåtet." : "Samtycket till Google Maps är återkallat.");
  };

  const clearAll = () => {
    for (const key of [CONSENT_KEY, STORAGE_KEY, "car_dealer_accounts"]) localStorage.removeItem(key);
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_user");
    window.dispatchEvent(new Event("car-dealer:consent-changed"));
    window.dispatchEvent(new Event("car-dealer:cars-changed"));
    setStatus("All data som webbplatsen sparat i din webbläsare är borttagen.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6 border border-gray-300 rounded-lg p-4">
        <div>
          <p id="maps-label" className="font-semibold text-navy">Visa Google Maps-karta</p>
          <p id="maps-desc" className="text-sm text-gray-700 mt-1">
            Kartan på kontaktsidan. Google kan sätta cookies och får din IP-adress.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={consent.maps}
          aria-labelledby="maps-label"
          aria-describedby="maps-desc"
          onClick={toggleMaps}
          className={`relative shrink-0 inline-flex h-8 w-14 items-center rounded-full border-2 transition-colors ${
            consent.maps ? "bg-primary border-primary" : "bg-gray-200 border-gray-500"
          }`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
              consent.maps ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
          <span className="sr-only">{consent.maps ? "På" : "Av"}</span>
        </button>
      </div>

      <div className="flex items-start justify-between gap-6 border border-gray-300 rounded-lg p-4">
        <div>
          <p className="font-semibold text-navy">Nödvändig lagring</p>
          <p className="text-sm text-gray-700 mt-1">Alltid på – behövs för att webbplatsen ska fungera.</p>
        </div>
        <span className="text-sm font-medium text-gray-800">Alltid på</span>
      </div>

      <button
        type="button"
        onClick={clearAll}
        className="border border-gray-500 text-navy px-5 py-2.5 rounded-lg font-medium hover:border-primary hover:text-primary transition-colors"
      >
        Rensa all sparad data
      </button>

      <p role="status" aria-live="polite" className="text-sm font-medium text-green-800 min-h-5">
        {status}
      </p>
    </div>
  );
}
