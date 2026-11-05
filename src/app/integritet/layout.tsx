import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description: "Läs om hur Car Dealer AB hanterar dina personuppgifter i enlighet med GDPR.",
};

export default function IntegritetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
