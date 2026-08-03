import type { MetadataRoute } from "next"

import { prisma } from "@/lib/prisma"
import { isPreOrderDeadlineActive } from "@/lib/preorder"

const siteUrl = "https://www.shinseidiecast.com"

const staticPages: MetadataRoute.Sitemap = [
  {
    url: `${siteUrl}/`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  },
  {
    url: `${siteUrl}/cars`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.95,
  },
  {
    url: `${siteUrl}/pre-orders`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${siteUrl}/protectors`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${siteUrl}/track-order`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  },
  {
    url: `${siteUrl}/terms-and-conditions`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/privacy-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/shipping-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${siteUrl}/refund-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

  const [brands, products] = await Promise.all([
    prisma.brand.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        createdAt: true,
        isPreOrder: true,
        preOrderDeadline: true,
      },
    }),
  ])

  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${siteUrl}/brands/${brand.id}`,
    lastModified: brand.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const productPages: MetadataRoute.Sitemap = products
    .filter((product) => {
      if (!product.isPreOrder) return true
      return isPreOrderDeadlineActive(product, todayKey)
    })
    .map((product) => ({
      url: `${siteUrl}/products/${product.id}`,
      lastModified: product.createdAt,
      changeFrequency: product.isPreOrder ? "weekly" : "daily",
      priority: product.isPreOrder ? 0.6 : 0.8,
    }))

  return [...staticPages, ...brandPages, ...productPages]
}
