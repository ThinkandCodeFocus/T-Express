import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Back-offices et pages propres à un client connecté : sans intérêt
      // pour la recherche, et à ne pas voir apparaître dans les résultats.
      disallow: [
        "/admin",
        "/super-admin",
        "/my-account",
        "/orders",
        "/cart",
        "/checkout",
        "/wishlist",
        "/payment",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
