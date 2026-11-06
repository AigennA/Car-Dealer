import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: "Våra bilar", template: `%s | ${SITE.name}` },
  description: "Utforska vårt lager av kvalitetskontrollerade begagnade bilar. Filtrera efter märke, bränsle, pris och mer.",
};

export default function BilarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
