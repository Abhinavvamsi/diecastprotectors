import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { getIndiaDateKey } from "@/lib/preorder"

export async function POST(
  req: Request
) {

  try {

    await requireAdmin()

    const body =
      await req.json()

    if (
      body.preOrderDeadline &&
      body.preOrderDeadline < getIndiaDateKey()
    ) {
      return NextResponse.json(
        {
          error: "Pre-order deadline cannot be in the past",
        },
        {
          status: 400,
        }
      )
    }

    const product =
      await prisma.product.create({

        data: {

          name: body.name,

          description: body.description,

          price: body.price,

          images: body.images,

          category: body.category,

          badge: body.badge,

          isPreOrder: body.isPreOrder ?? false,

          depositAmount: Number(body.depositAmount ?? 50),

          expectedArrival: body.expectedArrival || null,
		
          stock: body.stock,

          brandId: body.brandId,

          quantityPricing:
            body.quantityPricing || null,

        },

      })

    if (body.preOrderDeadline) {
      await prisma.$executeRaw`
        UPDATE "Product"
        SET "preOrderDeadline" = ${body.preOrderDeadline}
        WHERE id = ${product.id}
      `
    }

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
