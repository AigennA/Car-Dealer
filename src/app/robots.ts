import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { ROUTES } from "@/config/navigation";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: [`${ROUTES.staff}/`] }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
