import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      )
    }

    // Lock in consistent order
    items.sort((a: any, b: any) =>
      a.productId.localeCompare(b.productId)
    )

    const reservation =
      await prisma.$transaction(async (tx) => {

        // Lock + validate
        for (const item of items) {

          const products =
            await tx.$queryRaw<any[]>`
              SELECT *
              FROM "Product"
              WHERE id = ${item.productId}
              FOR UPDATE
            `

          const product = products[0]

          if (!product) {
            throw new Error(
              `${item.productId} not found`
            )
          }

          const available =
            product.stock -
            product.reservedStock

          if (available < item.quantity) {
            throw new Error(
              `${product.name} is sold out`
            )
          }

        }

        // Reserve stock
        for (const item of items) {

          await tx.product.update({

            where: {
              id: item.productId,
            },

            data: {

              reservedStock: {
                increment: item.quantity,
              },

            },

          })

        }

        // Create reservation
        return await tx.reservation.create({

          data: {

            userId,

            status: "ACTIVE",

            expiresAt: new Date(
              Date.now() + 5 * 60 * 1000
            ),

            items: {

              create: items.map((item: any) => ({

                productId: item.productId,

                quantity: item.quantity,

              })),

            },

          },

          include: {
            items: true,
          },

        })

      })

    return NextResponse.json({

      success: true,

      reservation,

    })

  } catch (error: any) {

    console.error(
      "Reservation Error:",
      error
    )

    return NextResponse.json(

      {
        error: error.message,
      },

      {
        status: 400,
      }

    )

  }
}