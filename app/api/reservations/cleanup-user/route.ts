import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { releaseExpiredReservations } from "@/lib/reservation-cleanup"

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const expiredCount = await prisma.$transaction(async (tx) => {
      return releaseExpiredReservations({
        client: tx,
        userId,
      })
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
