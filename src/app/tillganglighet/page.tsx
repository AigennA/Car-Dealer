import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Ul } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site";
import { ROUTES } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Tillgänglighetsredogörelse",
  description:
    `Hur ${SITE.name}s webbplats uppfyller WCAG 2.2 nivå AA, kända brister, hur vi testar och hur du kontaktar oss om något inte fungerar.`,
};

const a = "text-primary underline underline-offset-4";

export default function TillganglighetPage() {
  return (
    <LegalPage
      title="Tillgänglighetsredogörelse"
      updated="2026-11-06"
      intro={
        <p>
          {SITE.legalName} vill att alla ska kunna hitta och köpa bil hos oss, oavsett funktionsförmåga.
          Här beskriver vi hur webbplatsen uppfyller tillgänglighetskraven, vilka kända brister som finns
          och hur du kan få hjälp.
        </p>
      }
      sections={[
        {
          id: "status",
          title: "Hur tillgänglig är webbplatsen?",
          content: (
            <>
              <p>
                Vi bedömer att webbplatsen <strong>i huvudsak uppfyller</strong> WCAG 2.2 nivå AA (EN 301 549).
                De brister vi känner till beskrivs nedan.
              </p>
              <p>Det här kan du göra på webbplatsen:</p>
              <Ul>
                <li>använda hela webbplatsen med enbart tangentbord, med tydligt synligt fokus,</li>
                <li>hoppa direkt till huvudinnehållet med länken som visas vid första Tab-tryckningen,</li>
                <li>använda skärmläsare – sidorna har rubriker, landmärken, etiketter och statusmeddelanden,</li>
                <li>förstora texten till 400 % utan att innehåll försvinner eller måste scrollas i sidled,</li>
                <li>
                  slippa rörelse: animationer stängs av om du valt ”minska rörelse” i operativsystemet, och
                  bildspelet på startsidan kan pausas,
                </li>
                <li>läsa all text med minst 4,5:1 i kontrast (3:1 för stor text).</li>
              </Ul>
            </>
          ),
        },
        {
          id: "brister",
          title: "Kända brister",
          content: (
            <Ul>
              <li>
                <strong>Google Maps-kartan</strong> på kontaktsidan är tredjepartsinnehåll som vi inte kan
                påverka och den är svår att använda med tangentbord och skärmläsare. Adressen och en länk till
                vägbeskrivning finns alltid som text bredvid kartan.
              </li>
              <li>
                <strong>Bilbilderna</strong> har alternativtext med bilens namn men beskriver inte bilens skick
                i detalj. Fråga oss gärna, så beskriver vi bilen.
              </li>
              <li>
                <strong>Personalens admin-sida</strong> är byggd för dator; tabellen behöver scrollas i sidled
                på små skärmar.
              </li>
              <li>
                Webbplatsen har ännu inte testats av användare som själva använder skärmläsare.
              </li>
            </Ul>
          ),
        },
        {
          id: "testning",
          title: "Hur vi har testat webbplatsen",
          content: (
            <>
              <p>Webbplatsen testas automatiskt vid varje ändring och har granskats manuellt:</p>
              <Ul>
                <li>automatiska WCAG 2.2 A/AA-tester med axe-core på alla sidor, på dator och mobil,</li>
                <li>pixelbaserade kontrasttester för text på bilder och färgtoningar,</li>
                <li>
                  automatiska tangentbordstester (hoppa-till-innehåll, fokus, meny, dialoger, formulär),
                </li>
                <li>manuell granskning mot WCAG 2.2 AA och en heuristisk utvärdering av användbarheten.</li>
              </Ul>
              <p>Den senaste granskningen gjordes i november 2026.</p>
            </>
          ),
        },
        {
          id: "kontakt",
          title: "Om något inte fungerar",
          content: (
            <>
              <p>
                Om du stöter på hinder, eller behöver information i ett annat format, kontakta oss så hjälper
                vi dig:
              </p>
              <Ul>
                <li>
                  E-post: <a className={a} href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </li>
                <li>
                  Telefon: <a className={a} href={SITE.phoneHref}>{SITE.phone}</a> ({SITE.openingHours})
                </li>
                <li>
                  <Link className={a} href={ROUTES.contact}>Kontaktformuläret</Link>
                </li>
              </Ul>
              <p>Vi svarar inom två arbetsdagar.</p>
            </>
          ),
        },
        {
          id: "tillsyn",
          title: "Tillsyn",
          content: (
            <p>
              För e-handelstjänster är Post- och telestyrelsen (PTS) tillsynsmyndighet enligt lagen
              (2023:254) om vissa produkters och tjänsters tillgänglighet. Om du inte är nöjd med hur vi
              hanterar dina synpunkter kan du kontakta PTS, <a className={a} href="https://www.pts.se">pts.se</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
