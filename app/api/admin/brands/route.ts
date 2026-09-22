import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import {
  getIndiaDateKey,
  isPreOrderDeadlineActive,
} from "@/lib/preorder"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const visibleOnly =
    searchParams.get("visibleOnly") === "true"

  if (visibleOnly) {
    const now = new Date()
    const todayKey = getIndiaDateKey(now)
    const brands =
      await prisma.brand.findMany({
        include: {
          products: {
            select: {
              stock: true,
              reservedStock: true,
              isPreOrder: true,
              preOrderDeadline: true,
              saleHiddenUntil: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })

    return NextResponse.json(
      brands.map((brand) => {
        const visibleProductCount =
          brand.products.filter((product) => {
            const availableStock = Math.max(
              0,
              Number(product.stock || 0) -
                Number(product.reservedStock || 0)
            )
            const saleHiddenUntil = product.saleHiddenUntil
              ? new Date(product.saleHiddenUntil)
              : null
            const isSaleHidden =
              saleHiddenUntil &&
              Number.isFinite(saleHiddenUntil.getTime()) &&
              saleHiddenUntil.getTime() > now.getTime()

            return (
              availableStock > 0 &&
              !isSaleHidden &&
              isPreOrderDeadlineActive(product, todayKey)
            )
          }).length
        const { products, ...brandData } = brand
        void products

        return {
          ...brandData,
          _count: {
            products: visibleProductCount,
          },
        }
      }),
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    )
  }

  const brands =
    await prisma.brand.findMany({

      include: {

        _count: {

          select: {

            products: true,

          },

        },

      },

      orderBy: {

        name: "asc",

      },

    })

  return NextResponse.json(
    brands,
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  )

}

export async function POST(
  request: Request
) {

  const body =
    await request.json()

  const brand =
    await prisma.brand.create({

      data: {

        name: body.name,

        logo: body.logo,

      },

    })

  return NextResponse.json(
    brand
  )

}
