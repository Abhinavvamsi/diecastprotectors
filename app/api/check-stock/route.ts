import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function safeReadJson(
  req: Request
) {
  try {
    const text = await req.text()

    if (!text.trim()) {
      return null
    }

    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function POST(
  req: Request
) {
  try {

  const body =
    await safeReadJson(req)

  const products =
    Array.isArray(body?.products)
      ? body.products
      : []

  if (products.length === 0) {
    return NextResponse.json(
      {
        valid: false,
        message:
          "No products provided",
      },
      {
        status: 400,
      }
    )
  }

  for (
    const item of products
  ) {
    if (
      !item ||
      typeof item.id !== "string" ||
      !Number.isFinite(
        Number(item.quantity)
      ) ||
      Number(item.quantity) <= 0
    ) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "Invalid product data",
        },
        {
          status: 400,
        }
      )
    }

    const product =
      await prisma.product.findUnique({

        where: {
          id: item.id,
        },

      })

    if (
      !product
    ) {

      return NextResponse.json(
        {
          valid: false,
          message:
            `${item.name} no longer exists`,
        },
        {
          status: 400,
        }
      )

    }

    const hiddenSaleProduct =
      await prisma.$queryRaw<
        Array<{
          id: string
        }>
      >`
        SELECT id
        FROM "Product"
        WHERE id = ${product.id}
          AND "saleHiddenUntil" IS NOT NULL
          AND "saleHiddenUntil" > ${new Date().toISOString()}
        LIMIT 1
      `

    if (hiddenSaleProduct.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          message:
            `${item.name} will be available when the sale starts`,
        },
        {
          status: 400,
        }
      )
    }

    if (
      product.stock - (product.reservedStock || 0) <
      item.quantity
    ) {

      return NextResponse.json(
        {
          valid: false,
          message:
            `${item.name} is out of stock`,
        },
        {
          status: 400,
        }
      )

    }

  }

  return NextResponse.json({
    valid: true,
  })
  } catch (error) {
    console.error(
      "Check Stock Error:",
      error
    )

    return NextResponse.json(
      {
        valid: false,
        message:
          "Unable to verify stock right now",
      },
      {
        status: 500,
      }
    )
  }

}
