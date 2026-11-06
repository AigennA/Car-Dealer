import type { MetadataRoute } from "next";
import { cars } from "@/lib/cars";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

const PAGES = ["", "bilar", "finansiering", "inbyte", "om-oss", "kontakt", "villkor", "integritet", "cookies", "tillganglighet"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({
      url: `${SITE.url}/${p ? `${p}/` : ""}`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : p === "bilar" ? 0.9 : 0.5,
    })),
    ...cars.map((c) => ({
      url: `${SITE.url}/bilar/${c.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
