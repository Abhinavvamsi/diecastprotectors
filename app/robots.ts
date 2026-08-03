import type { MetadataRoute } from "next"

const siteUrl = "https://www.shinseidiecast.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/cart",
          "/checkout",
          "/processing",
          "/success",
          "/orders",
          "/sign-in/",
          "/sign-up/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
