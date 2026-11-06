import Link from "next/link";
import LegalPage, { Table, Ul } from "@/components/legal/LegalPage";
import { SITE } from "@/lib/site";
import { BUSINESS } from "@/config/business";
import { ROUTES } from "@/config/navigation";

const a = "text-primary underline underline-offset-4";

export default function IntegritetPage() {
  return (
    <LegalPage
      title="Integritetspolicy"
      updated="2026-11-06"
      intro={
        <>
          <p>
            Här förklarar vi vilka personuppgifter {SITE.legalName} behandlar när du besöker
            webbplatsen eller kontaktar oss, varför vi gör det och vilka rättigheter du har enligt
            dataskyddsförordningen (GDPR).
          </p>
          <p className="text-base">
            <strong>Kortfattat:</strong> vi samlar bara in det du själv skickar till oss, använder det
            för att svara dig och sälja/värdera bilar, säljer aldrig dina uppgifter och använder inga
            spårnings- eller reklamcookies.
          </p>
        </>
      }
      sections={[
        {
          id: "ansvarig",
          title: "Personuppgiftsansvarig",
          content: (
            <>
              <p>{SITE.legalName} är personuppgiftsansvarig för behandlingen som beskrivs här.</p>
              <address className="not-italic bg-surface rounded-lg p-4">
                {SITE.legalName}
                <br />
                {SITE.address.street}, {SITE.address.postalCode} {SITE.address.city}
                <br />
                E-post: <a className={a} href={`mailto:${SITE.email}`}>{SITE.email}</a>
                <br />
                Telefon: <a className={a} href={SITE.phoneHref}>{SITE.phone}</a>
              </address>
            </>
          ),
        },
        {
          id: "uppgifter",
          title: "Vilka uppgifter vi behandlar, varför och med vilken rättslig grund",
          content: (
            <Table
              caption="Behandlingar av personuppgifter"
              head={["När", "Uppgifter", "Ändamål", "Rättslig grund", "Lagringstid"]}
              rows={[
                [
                  "Du använder kontaktformuläret eller ringer/mejlar",
                  "Namn, e-post, telefon (valfritt), meddelande, ev. vilken bil det gäller",
                  "Svara på frågor, boka provkörning",
                  "Berättigat intresse (art. 6.1 f) – att kunna svara dig",
                  `${BUSINESS.dataRetention.leadMonths} månader efter sista kontakt`,
                ],
                [
                  "Du begär inbytesvärdering",
                  "Namn, kontaktuppgifter, bilens märke, modell, årsmodell, miltal, beskrivning",
                  "Värdera din bil och lämna erbjudande",
                  "Åtgärder före avtal (art. 6.1 b)",
                  `${BUSINESS.dataRetention.tradeInMonths} månader om inget köp sker`,
                ],
                [
                  "Du köper eller finansierar en bil",
                  "Identitets- och kontaktuppgifter, personnummer, betal- och avtalsuppgifter",
                  "Fullgöra köpeavtalet, garanti, reklamation",
                  "Avtal (art. 6.1 b) och rättslig förpliktelse (art. 6.1 c)",
                  `${BUSINESS.dataRetention.bookkeepingYears} år enligt bokföringslagen; avtal så länge garanti/reklamationsrätt gäller`,
                ],
                [
                  "Du besöker webbplatsen",
                  "IP-adress och teknisk information i serverloggar hos vår webbhotell (GitHub Pages)",
                  "Leverera sidan, säkerhet",
                  "Berättigat intresse (art. 6.1 f)",
                  "Enligt GitHubs loggpolicy (normalt kort)",
                ],
              ]}
            />
          ),
        },
        {
          id: "lokalt",
          title: "Uppgifter som bara sparas i din webbläsare",
          content: (
            <>
              <p>
                Vissa uppgifter sparas enbart lokalt i din webbläsare (localStorage/sessionStorage) och
                skickas aldrig till oss:
              </p>
              <Ul>
                <li>ditt val om kartan ska visas (samtycke till Google Maps),</li>
                <li>inloggning och bilar som läggs till i personalens demo-admin.</li>
              </Ul>
              <p>
                Du kan när som helst ta bort dem under <Link className={a} href={ROUTES.cookies}>Cookies och lagring</Link>{" "}
                eller genom att rensa webbplatsdata i webbläsaren.
              </p>
            </>
          ),
        },
        {
          id: "mottagare",
          title: "Vilka vi delar uppgifter med",
          content: (
            <>
              <p>Vi säljer aldrig personuppgifter. Uppgifter kan delas med:</p>
              <Ul>
                <li>
                  <strong>Personuppgiftsbiträden</strong> som hjälper oss med drift, e-post och IT – de får
                  bara behandla uppgifterna enligt våra instruktioner.
                </li>
                <li>
                  <strong>Finansieringspartner</strong> (bank/finansbolag) – endast om du ansöker om billån
                  eller leasing.
                </li>
                <li>
                  <strong>Myndigheter</strong> som Transportstyrelsen (ägarbyte) och Skatteverket när lagen
                  kräver det.
                </li>
              </Ul>
              <p>
                <strong>Tredjepartsinnehåll på webbplatsen:</strong> bilbilderna hämtas från Unsplash, vilket
                innebär att din IP-adress når Unsplash när bilderna laddas. Google Maps laddas{" "}
                <em>bara</em> om du aktivt väljer att visa kartan.
              </p>
            </>
          ),
        },
        {
          id: "overforing",
          title: "Överföring till länder utanför EU/EES",
          content: (
            <p>
              GitHub (webbhotell), Unsplash och Google är amerikanska företag. Överföring sker med stöd av
              EU-kommissionens beslut om adekvat skyddsnivå för EU–US Data Privacy Framework, eller
              EU-kommissionens standardavtalsklausuler.
            </p>
          ),
        },
        {
          id: "rattigheter",
          title: "Dina rättigheter",
          content: (
            <>
              <p>Du har rätt att:</p>
              <Ul>
                <li>få veta vilka uppgifter vi har om dig (registerutdrag),</li>
                <li>få felaktiga uppgifter rättade,</li>
                <li>få uppgifter raderade när de inte längre behövs,</li>
                <li>begränsa eller invända mot behandling som bygger på berättigat intresse,</li>
                <li>få ut uppgifter du gett oss i ett maskinläsbart format (dataportabilitet),</li>
                <li>när som helst återkalla ett samtycke.</li>
              </Ul>
              <p>
                Kontakta oss på <a className={a} href={`mailto:${SITE.email}`}>{SITE.email}</a>. Vi svarar inom en
                månad.
              </p>
            </>
          ),
        },
        {
          id: "sakerhet",
          title: "Säkerhet",
          content: (
            <p>
              Webbplatsen använder krypterad anslutning (HTTPS). Endast personal som behöver uppgifterna i sitt
              arbete har tillgång till dem.
            </p>
          ),
        },
        {
          id: "klagomal",
          title: "Klagomål",
          content: (
            <p>
              Om du anser att vi behandlar dina uppgifter felaktigt kan du lämna klagomål till
              Integritetsskyddsmyndigheten (IMY), <a className={a} href="https://www.imy.se">imy.se</a>.
              Hör gärna av dig till oss först, så försöker vi lösa det.
            </p>
          ),
        },
        {
          id: "andringar",
          title: "Ändringar",
          content: (
            <p>
              Vi uppdaterar policyn när vår behandling ändras. Datumet högst upp visar när den senast
              ändrades.
            </p>
          ),
        },
      ]}
    />
  );
}
