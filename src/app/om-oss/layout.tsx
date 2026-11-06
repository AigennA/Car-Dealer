import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Om oss",
  description: `Lär känna ${SITE.legalName} – din pålitliga partner för bilaffärer sedan ${SITE.foundedYear}.`,
};

export default function OmOssLayout({ children }: { children: React.ReactNode }) {
  return children;
}
