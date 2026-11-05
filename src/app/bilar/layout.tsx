import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Våra bilar", template: "%s | Car Dealer" },
  description: "Utforska vårt lager av kvalitetskontrollerade begagnade bilar. Filtrera efter märke, bränsle, pris och mer.",
};

export default function BilarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
