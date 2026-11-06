import type { MetadataRoute } from "next";
import { cars } from "@/lib/cars";
import { SITE } from "@/lib/site";
import { ROUTES, SITEMAP_PAGES } from "@/config/navigation";

export const dynamic = "force-static";

const absolute = (path: string) => `${SITE.url}${path === "/" ? "/" : `${path}/`}`;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...SITEMAP_PAGES.map(({ path, priority }) => ({ url: absolute(path), changeFrequency: "weekly" as const, priority })),
    ...cars.map((c) => ({ url: absolute(`${ROUTES.cars}/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
