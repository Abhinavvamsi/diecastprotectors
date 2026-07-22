import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const expiredReservations =
      await prisma.reservation.findMany({
        where: {
          userId,
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
              userId,
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
          const product = await tx.product.findUnique({
            where: {
              id: item.productId,
            },
            select: {
              isPreOrder: true,
            },
          })

          if (product?.isPreOrder) continue

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
    console.error("User reservation cleanup error:", error)

    return NextResponse.json(
      { error: "Failed to clean up reservations" },
      { status: 500 }
    )
  }
}
