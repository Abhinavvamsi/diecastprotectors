import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

export async function POST(
  req: Request
) {

  try {

    /* Protect API */
    await requireAdmin()

    const { searchParams } =
      new URL(req.url)

    const id =
      searchParams.get("id")

    if (!id) {

      return NextResponse.json(

        {
          error: "Missing product id",
        },

        {
          status: 400,
        }

      )

    }

    const body =
      await req.json()

    const updatedProduct =
      await prisma.product.update({

        where: {
          id,
        },

        data: {

          name:
            body.name,

          description:
            body.description,

          price:
            body.price,

          images:
            body.images,

          category:
            body.category,

          badge:
            body.badge,

          stock:
            body.stock,

          reservedStock: {
            set: Math.max(
              0,
              Math.min(
                Number(body.reservedStock || 0),
                Number(body.stock || 0)
              )
            ),
          },

          brandId:
            body.brandId,

          quantityPricing:
            body.quantityPricing,

        },

      })

    return NextResponse.json(
      updatedProduct
    )

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {
        error:
          "Failed to update product",
      },

      {
        status: 500,
      }

    )

  }

}
