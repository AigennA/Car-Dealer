import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inbyte | Car Dealer",
  description: "Byt in din gamla bil och få en rättvis värdering. Vi köper alla bilmärken och modeller.",
};

export default function InbyteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
