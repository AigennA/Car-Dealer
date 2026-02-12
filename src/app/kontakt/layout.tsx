import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakta oss | Car Dealer",
  description: "Kontakta Car Dealer för frågor om bilar, finansiering eller inbyte. Vi finns i Stockholm.",
};

export default function KontaktLayout({ children }: { children: React.ReactNode }) {
  return children;
}
