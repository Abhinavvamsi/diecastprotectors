import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json()
    const ids = Array.isArray(body.ids)
      ? body.ids.filter(Boolean)
      : []

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No product ids provided" },
        { status: 400 }
      )
    }

    await prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: ids.length,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 }
    )
  }
}
