import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const coupons =
    await prisma.coupon.findMany({

      orderBy: {

        createdAt:
          "desc",

      },

    })

  return NextResponse.json(
    coupons
  )

}

export async function POST(
  req: Request
) {

  const body =
    await req.json()

  const coupon =
    await prisma.coupon.create({

      data: {

        code:
          body.code,

        type:
          body.type,

        value:
          body.value,

        minOrder:
          body.minOrder || 0,

      },

    })

  return NextResponse.json(
    coupon
  )

}