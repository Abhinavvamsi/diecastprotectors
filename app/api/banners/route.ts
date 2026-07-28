import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(banners, {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    )
  }
}
