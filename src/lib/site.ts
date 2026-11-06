import { BUSINESS, fullAddress, hoursSummary, phoneHref } from "@/config/business";

/**
 * Site-wide facts, derived from data/business.json (see src/config/business.ts).
 * Kept as `SITE` so components have one short import.
 */
export const SITE = {
  name: BUSINESS.name,
  legalName: BUSINESS.legalName,
  orgNumber: BUSINESS.orgNumber,
  foundedYear: BUSINESS.foundedYear,
  copyrightHolder: BUSINESS.copyrightHolder,
  url: BUSINESS.url,
  description: BUSINESS.description,
  tagline: BUSINESS.tagline,
  phone: BUSINESS.contact.phone,
  phoneHref,
  email: BUSINESS.contact.email,
  address: BUSINESS.address,
  fullAddress,
  openingHours: hoursSummary(BUSINESS.showroomHours),
  policies: BUSINESS.policies,
} as const;

export type Person = { name: string; role: string; photo: string; bio?: string };

/**
 * Customer advisor shown in the "Kundservice" blocks. Stock photos from
 * Unsplash (free licence) — replace with real staff photos before launch.
 * If a photo fails to load, PersonPhoto falls back to the person's initials.
 */
export const ADVISOR: Person = {
  name: "Sara Lindqvist",
  role: "Kundrådgivare",
  photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop&crop=faces",
};

export const TEAM: Person[] = [
  {
    name: "Erik Andersson",
    role: "VD & Grundare",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop&crop=faces",
    bio: "Med 15 års erfarenhet inom bilbranschen leder Erik företaget med passion och vision.",
  },
  {
    name: "Maria Svensson",
    role: "Försäljningschef",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=faces",
    bio: "Maria hjälper våra kunder att hitta rätt bil med expertis och engagemang.",
  },
  {
    name: "Johan Karlsson",
    role: "Finansieringsrådgivare",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=faces",
    bio: "Johan ser till att varje kund får den bästa finansieringslösningen för sina behov.",
  },
];
