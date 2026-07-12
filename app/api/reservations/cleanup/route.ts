import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const authorization =
    req.headers.get("authorization")

  if (
    !process.env.CRON_SECRET ||
    authorization !==
      `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const expiredReservations =
      await prisma.reservation.findMany({
        where: {
          status: "ACTIVE",
          expiresAt: {
            lte: new Date(),
          },
        },
        include: {
          items: true,
        },
      })

    let expiredCount = 0

    await prisma.$transaction(async (tx) => {
      for (const reservation of expiredReservations) {
        const expiredReservation =
          await tx.reservation.updateMany({
            where: {
              id: reservation.id,
              status: "ACTIVE",
              expiresAt: {
                lte: new Date(),
              },
            },
            data: {
              status: "EXPIRED",
            },
          })

        if (!expiredReservation.count) continue

        expiredCount += 1

        for (const item of reservation.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              reservedStock: {
                decrement: item.quantity,
              },
            },
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      expiredReservations: expiredCount,
    })
  } catch (error) {
    console.error("Reservation cleanup error:", error)

    return NextResponse.json(
      { error: "Failed to clean up reservations" },
      { status: 500 }
    )
  }
}
