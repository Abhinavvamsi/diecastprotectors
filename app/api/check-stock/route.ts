import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request
) {

  const body =
    await req.json()

  for (
    const item of body.products
  ) {

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

}
