import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tjänster & Finansiering",
  description: "Flexibla finansieringslösningar, privatleasing och inbyte. Beräkna din månadskostnad direkt.",
};

export default function FinansieringLayout({ children }: { children: React.ReactNode }) {
  return children;
}
