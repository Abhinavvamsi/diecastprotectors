import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    const { reservationId } = await req.json()

    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID required" },
        { status: 400 }
      )
    }

    const reservation =
      await prisma.reservation.findUnique({

        where: {
          id: reservationId,
        },

        include: {
          items: true,
        },

      })

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      )
    }

    const { userId } = await auth()

    if (userId && reservation.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Already cancelled / expired / completed
    if (reservation.status !== "ACTIVE") {
      return NextResponse.json({
        success: true,
      })
    }

    await prisma.$transaction(async (tx) => {

      const cancelledReservation =
        await tx.reservation.updateMany({
          where: {
            id: reservation.id,
            status: "ACTIVE",
          },
          data: {
            status: "CANCELLED",
          },
        })

      if (!cancelledReservation.count) return

      for (const item of reservation.items) {

        const product =
          await tx.product.findUnique({

            where: {
              id: item.productId,
            },

          })

        if (!product) continue

        await tx.product.update({

          where: {
            id: item.productId,
          },

          data: {

            reservedStock: Math.max(
              0,
              product.reservedStock - item.quantity
            ),

          },

        })

      }
    })

    return NextResponse.json({

      success: true,

    })

  } catch (error) {

    console.error("Cancel Reservation Error:", error)

    return NextResponse.json(
      {
        error: "Failed to cancel reservation",
      },
      {
        status: 500,
      }
    )

  }
}
