import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { releaseExpiredReservationsThrottled } from "@/lib/reservation-cleanup"
import { applySiteDiscountToProduct } from "@/lib/site-discount"
import { getStoreSiteDiscountSettings } from "@/lib/site-discount-server"

export async function GET() {

  await releaseExpiredReservationsThrottled()

  const products =
    await prisma.product.findMany({

      where: {
        category: "Cars",
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
    new Set(
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
    await getStoreSiteDiscountSettings()

  return NextResponse.json(
    products
      .filter((product) => !hiddenSaleIds.has(product.id))
      .map((product) =>
        applySiteDiscountToProduct(
          {
            ...product,
            stock: Math.max(
              0,
              product.stock - product.reservedStock
            ),
          },
          siteDiscountSettings
        )
      ),
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  )

}
