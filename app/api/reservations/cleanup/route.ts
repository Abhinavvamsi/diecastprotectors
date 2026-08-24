import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { releaseExpiredReservations } from "@/lib/reservation-cleanup"

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
    const expiredCount = await prisma.$transaction(async (tx) => {
      return releaseExpiredReservations({
        client: tx,
        take: 250,
      })
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
