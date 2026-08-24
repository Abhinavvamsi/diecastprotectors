import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

type ReservationCleanupClient =
  | typeof prisma
  | Prisma.TransactionClient

type ReleaseExpiredReservationsOptions = {
  client?: ReservationCleanupClient
  productIds?: string[]
  userId?: string
  take?: number
}

let lastThrottledCleanupAt = 0

export async function releaseExpiredReservations({
  client = prisma,
  productIds = [],
  userId,
  take = 100,
}: ReleaseExpiredReservationsOptions = {}) {
  const uniqueProductIds = Array.from(
    new Set(
      productIds.filter(
        (productId) =>
          typeof productId === "string" &&
          productId.trim()
      )
    )
  )

  const expiredReservations =
    await client.reservation.findMany({
      where: {
        ...(userId ? { userId } : {}),
        status: "ACTIVE",
        expiresAt: {
          lte: new Date(),
        },
        ...(uniqueProductIds.length > 0
          ? {
              items: {
                some: {
                  productId: {
                    in: uniqueProductIds,
                  },
                },
              },
            }
          : {}),
      },
      include: {
        items: true,
      },
      orderBy: {
        expiresAt: "asc",
      },
      take,
    })

  let expiredCount = 0

  for (const reservation of expiredReservations) {
    const expiredReservation =
      await client.reservation.updateMany({
        where: {
          id: reservation.id,
          ...(userId ? { userId } : {}),
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
      await client.$executeRaw`
        UPDATE "Product"
        SET "reservedStock" = GREATEST(0, "reservedStock" - ${item.quantity})
        WHERE id = ${item.productId}
      `
    }
  }

  return expiredCount
}

export async function releaseExpiredReservationsThrottled({
  intervalMs = 60 * 1000,
  take = 100,
}: {
  intervalMs?: number
  take?: number
} = {}) {
  const now = Date.now()

  if (now - lastThrottledCleanupAt < intervalMs) {
    return 0
  }

  lastThrottledCleanupAt = now

  try {
    return await prisma.$transaction(async (tx) => {
      return releaseExpiredReservations({
        client: tx,
        take,
      })
    })
  } catch (error) {
    lastThrottledCleanupAt = 0
    throw error
  }
}
