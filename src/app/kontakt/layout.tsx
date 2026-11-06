import { SITE } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakta oss",
  description: `Kontakta ${SITE.name} för frågor om bilar, finansiering eller inbyte. Vi finns i ${SITE.address.city}.`,
};

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return children;
}
