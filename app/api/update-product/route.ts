import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { getIndiaDateKey } from "@/lib/preorder"

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

    const desiredReservedStock = Math.max(
      0,
      Math.min(
        Number(body.reservedStock || 0),
        Number(body.stock || 0)
      )
    )

    const updatedProduct =
      await prisma.$transaction(async (tx) => {
        const currentProduct =
          await tx.product.findUnique({
            where: {
              id,
            },
          })

        if (!currentProduct) {
          throw new Error(
            "Product not found"
          )
        }

        if (
          Number(currentProduct.reservedStock || 0) !==
          desiredReservedStock
        ) {
          const activeReservations =
            await tx.reservation.findMany({
              where: {
                status: "ACTIVE",
                items: {
                  some: {
                    productId: id,
                  },
                },
              },
              include: {
                items: true,
              },
            })

          for (const reservation of activeReservations) {
            const reservationItem =
              reservation.items.find(
                (item) => item.productId === id
              )

            if (!reservationItem) continue

            await tx.reservation.updateMany({
              where: {
                id: reservation.id,
                status: "ACTIVE",
              },
              data: {
                status: "CANCELLED",
              },
            })

            await tx.product.update({
              where: {
                id,
              },
              data: {
                reservedStock: {
                  decrement:
                    reservationItem.quantity,
                },
              },
            })
          }
        }

        const updatedProduct = await tx.product.update({

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

            isPreOrder:
              body.isPreOrder ?? false,

            depositAmount:
              Number(body.depositAmount ?? 50),

            expectedArrival:
              body.expectedArrival || null,
		
            stock:
              body.stock,

            reservedStock: {
              set: desiredReservedStock,
            },

            brandId:
              body.brandId,

            quantityPricing:
              body.quantityPricing,

          },

        })

        await tx.$executeRaw`
          UPDATE "Product"
          SET "preOrderDeadline" = ${body.preOrderDeadline || null}
          WHERE id = ${id}
        `

        return updatedProduct
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
