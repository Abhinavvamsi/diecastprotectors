import { prisma } from "@/lib/prisma"
import type { SiteDiscountSettings } from "@/lib/site-discount"

let siteDiscountColumnsReady = false

export async function ensureSiteDiscountColumns() {
  if (siteDiscountColumnsReady) {
    return
  }

  await prisma.$executeRaw`
    ALTER TABLE "StoreSettings"
    ADD COLUMN IF NOT EXISTS "siteDiscountPercent" INTEGER DEFAULT 0
  `

  await prisma.$executeRaw`
    ALTER TABLE "StoreSettings"
    ADD COLUMN IF NOT EXISTS "siteDiscountEndsAt" TEXT
  `

  siteDiscountColumnsReady = true
}

export async function getStoreSiteDiscountSettings(): Promise<SiteDiscountSettings> {
  await ensureSiteDiscountColumns()

  const rows =
    await prisma.$queryRaw<
      Array<{
        siteDiscountPercent: number | null
        siteDiscountEndsAt: string | null
      }>
    >`
      SELECT "siteDiscountPercent", "siteDiscountEndsAt"
      FROM "StoreSettings"
      LIMIT 1
    `

  return {
    siteDiscountPercent: rows[0]?.siteDiscountPercent ?? 0,
    siteDiscountEndsAt: rows[0]?.siteDiscountEndsAt ?? null,
  }
}
