import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allmänna villkor | Car Dealer",
  description: "Läs våra allmänna villkor för köp och försäljning av fordon.",
};

export default function VillkorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
