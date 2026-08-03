import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

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

  return NextResponse.json(
    products
      .filter((product) => !hiddenSaleIds.has(product.id))
      .map((product) => ({
        ...product,
        stock: Math.max(
          0,
          product.stock - product.reservedStock
        ),
      })),
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  )

}
