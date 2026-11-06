import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Table } from "@/components/legal/LegalPage";
import CookieSettings from "@/components/legal/CookieSettings";
import { ROUTES } from "@/config/navigation";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookies och lagring",
  description: `Vilka cookies och vilken lokal lagring ${SITE.name} använder, och hur du ändrar ditt samtycke.`,
};

const a = "text-primary underline underline-offset-4";

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies och lagring"
      updated="2026-11-06"
      intro={
        <p>
          Vi använder <strong>inga</strong> cookies för statistik, spårning eller marknadsföring. Därför
          visar vi ingen cookie-banner. Det enda som kan sätta cookies är Google Maps, och det laddas bara
          om du själv väljer att visa kartan.
        </p>
      }
      sections={[
        {
          id: "installningar",
          title: "Dina inställningar",
          content: <CookieSettings />,
        },
        {
          id: "nodvandig",
          title: "Nödvändig lagring (kräver inte samtycke)",
          content: (
            <>
              <p>
                Enligt lagen om elektronisk kommunikation (LEK 9 kap. 28 §) krävs inget samtycke för lagring
                som är nödvändig för en tjänst du själv efterfrågar. Följande sparas bara i din webbläsare:
              </p>
              <Table
                caption="Nödvändig lokal lagring"
                head={["Namn", "Typ", "Syfte", "Livslängd"]}
                rows={[
                  ["car_dealer_consent", "localStorage", "Kommer ihåg om du har godkänt Google Maps", "Tills du ändrar eller rensar"],
                  ["admin_auth, admin_user", "sessionStorage", "Håller personal inloggad i demo-admin", "Tills fliken stängs"],
                  ["car_dealer_custom_cars", "localStorage", "Bilar som personal lagt till i demo-admin", "Tills de tas bort"],
                  ["car_dealer_accounts", "localStorage", "Demokonton för personalinloggning", "Tills du rensar"],
                ]}
              />
            </>
          ),
        },
        {
          id: "tredje-part",
          title: "Tredjepartstjänster",
          content: (
            <Table
              caption="Tredjepartstjänster"
              head={["Tjänst", "När", "Cookies", "Mer information"]}
              rows={[
                [
                  "Google Maps",
                  "Endast efter att du klickat på Visa karta",
                  "Ja, t.ex. NID och AEC (Google)",
                  <a key="g" className={a} href="https://policies.google.com/technologies/cookies?hl=sv">
                    Googles cookiepolicy
                  </a>,
                ],
                [
                  "Unsplash (bilbilder)",
                  "När bilder visas",
                  "Nej – men din IP-adress når Unsplash",
                  <a key="u" className={a} href="https://unsplash.com/privacy">
                    Unsplash integritetspolicy
                  </a>,
                ],
                ["Typsnitt", "Alltid", "Nej – typsnitten ligger på vår egen server", "–"],
              ]}
            />
          ),
        },
        {
          id: "webblasare",
          title: "Rensa via webbläsaren",
          content: (
            <p>
              Du kan också ta bort all lagrad data för webbplatsen i webbläsarens inställningar (ofta under
              ”Sekretess” → ”Webbplatsdata”). Läs mer om hur vi behandlar personuppgifter i vår{" "}
              <Link className={a} href={ROUTES.privacy}>
                integritetspolicy
              </Link>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
