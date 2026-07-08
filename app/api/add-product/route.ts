import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

export async function POST(
  req: Request
) {

  try {

    await requireAdmin()

    const body =
      await req.json()

    const product =
      await prisma.product.create({

        data: {

          name: body.name,

          description: body.description,

          price: body.price,

          images: body.images,

          category: body.category,

          badge: body.badge,

          stock: body.stock,

          brandId: body.brandId,

          quantityPricing:
            body.quantityPricing || null,

        },

      })

    return NextResponse.json(product)

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {
        error: "Failed to add product",
      },

      {
        status: 500,
      }

    )

  }

}