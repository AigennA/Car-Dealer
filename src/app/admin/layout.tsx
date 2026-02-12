import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Car Dealer",
  description: "Administrationspanel för hantering av bilar.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
