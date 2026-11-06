import type { Metadata } from "next";
import Link from "next/link";
import MyBooking from "@/components/workshop/manage/MyBooking";
import { ROUTES } from "@/config/navigation";
import { SITE } from "@/lib/site";
import { catalog } from "@/lib/workshop";

export const metadata: Metadata = {
  title: "Min bokning",
  description: `Se, flytta eller avboka din verkstads- eller besiktningstid hos ${SITE.name}.`,
  // Personal page: nothing here for search engines.
  robots: { index: false, follow: true },
};

const a = "text-primary underline underline-offset-4";

export default function MinBokningPage() {
  return (
    <div className="bg-surface">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:py-16 lg:grid-cols-[1fr_280px]">
        <div>
          <h1 className="mb-3 text-4xl font-bold text-navy">Min bokning</h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-700">
            Här ser du din verkstads- eller besiktningstid. Du kan flytta eller avboka den fram till{" "}
            {catalog.changeCutoffHours} timmar före besöket – inget konto behövs.
          </p>
          <MyBooking />
        </div>
        <aside aria-label="Hjälp med bokningen" className="space-y-4 text-gray-800 lg:pt-24">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-heading text-lg font-semibold text-navy">Hittar du inte bokningen?</h2>
            <p className="text-sm">
              Öppna länken i din bokningsbekräftelse, eller ring oss på{" "}
              <a className={a} href={SITE.phoneHref}>{SITE.phone}</a> ({SITE.openingHours}).
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-heading text-lg font-semibold text-navy">Boka en ny tid</h2>
            <ul className="space-y-1 text-sm">
              <li><Link className={a} href={ROUTES.workshop}>Verkstad</Link></li>
              <li><Link className={a} href={ROUTES.inspection}>Besiktning</Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
