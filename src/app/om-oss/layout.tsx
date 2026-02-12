import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Om oss | Car Dealer",
  description: "Lär känna Car Dealer AB - din pålitliga partner för bilaffärer sedan 2020.",
};

export default function OmOssLayout({ children }: { children: React.ReactNode }) {
  return children;
}
