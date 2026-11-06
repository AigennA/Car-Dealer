import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description: `Läs om hur ${SITE.legalName} hanterar dina personuppgifter i enlighet med GDPR.`,
};

export default function IntegritetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
