import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import {
  getIndiaDateKey,
  isPreOrderDeadlineActive,
} from "@/lib/preorder"

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

    const normalizedItemMap = new Map<string, any>()
    for (const item of items as Array<{
      productId: string
      quantity: number
    }>) {
      const existing = normalizedItemMap.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        normalizedItemMap.set(item.productId, { ...item })
      }
    }

    const normalizedItems = Array.from(normalizedItemMap.values())

    const sortedItems = [...normalizedItems].sort((a: any, b: any) =>
      a.productId.localeCompare(b.productId)
    )
	    const productIds = sortedItems.map((item: any) => item.productId)
	    const todayKey = getIndiaDateKey()

    const reservation =
      await prisma.$transaction(async (tx) => {

        const products =
	          await tx.$queryRaw<any[]>`
	            SELECT id, stock, "reservedStock", name, "isPreOrder", "preOrderDeadline"
	            FROM "Product"
            WHERE id IN (${Prisma.join(productIds)})
            FOR UPDATE
          `

        if (products.length !== productIds.length) {
          const foundIds = new Set(
            products.map((product) => product.id)
          )
          const missingProduct = sortedItems.find(
            (item: any) => !foundIds.has(item.productId)
          )

          throw new Error(
            `${missingProduct?.productId || "Product"} not found`
          )
        }

        const productMap = new Map(
          products.map((product) => [product.id, product])
        )

        for (const item of sortedItems) {
          const product = productMap.get(item.productId)
          const available =
            product.stock - product.reservedStock

	          if (available < item.quantity) {
	            throw new Error(
	              `${product.name} is sold out`
	            )
	          }

	          if (
	            product.isPreOrder &&
	            !isPreOrderDeadlineActive(
	              product,
	              todayKey
	            )
	          ) {
	            throw new Error(
	              `${product.name} pre-order deadline has ended`
	            )
	          }
	        }

        // Reserve stock
        for (const item of sortedItems) {
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
              Date.now() + 15 * 60 * 1000
            ),

            items: {

              create: sortedItems.map((item: any) => ({

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
