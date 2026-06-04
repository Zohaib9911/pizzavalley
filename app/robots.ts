import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/category/", "/product/", "/branches", "/about"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/account",
          "/account/",
          "/cart",
          "/orders",
          "/orders/",
        ],
      },
    ],
    sitemap: "https://pizzavalley.store/sitemap.xml",
    host:    "https://pizzavalley.store",
  };
}
