import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { releaseExpiredReservationsThrottled } from "@/lib/reservation-cleanup"
import { applySiteDiscountToProduct } from "@/lib/site-discount"
import { getStoreSiteDiscountSettings } from "@/lib/site-discount-server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const includePreOrder = searchParams.get("includePreOrder") === "true"
  const includeHiddenSale =
    searchParams.get("includeHiddenSale") === "true"

  if (includeHiddenSale) {
    await requireAdmin()
  }

  await releaseExpiredReservationsThrottled()

  const products =
  await prisma.product.findMany({
    where: includePreOrder
      ? undefined
      : {
          isPreOrder: false,
        },

    include: {
      brand: true,
    },

    orderBy: {
      createdAt: "desc",
    },

  })

  const hiddenSaleIds =
    includeHiddenSale
      ? new Set<string>()
      : new Set(
          (
            await prisma.$queryRaw<
              Array<{
                id: string
              }>
            >`
              SELECT id
              FROM "Product"
              WHERE "saleHiddenUntil" IS NOT NULL
                AND "saleHiddenUntil" > ${new Date().toISOString()}
            `
          ).map((product) => product.id)
        )

  const siteDiscountSettings =
    includeHiddenSale
      ? null
      : await getStoreSiteDiscountSettings()

    return NextResponse.json(
      products
        .filter((product) => !hiddenSaleIds.has(product.id))
        .map((product) => {
          const normalizedProduct = {
            ...product,
            stock: Math.max(
              0,
              product.stock - product.reservedStock
            ),
          }

          return siteDiscountSettings
            ? applySiteDiscountToProduct(
                normalizedProduct,
                siteDiscountSettings
              )
            : normalizedProduct
        }),
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    )

}
