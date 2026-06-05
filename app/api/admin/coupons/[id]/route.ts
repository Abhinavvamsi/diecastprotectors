import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } =
    await params

  await prisma.coupon.delete({

    where: {
      id,
    },

  })

  return NextResponse.json({

    success: true,

  })

}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } =
    await params

  const coupon =
    await prisma.coupon.findUnique({

      where: {
        id,
      },

    })

  if (!coupon) {

    return NextResponse.json(

      {
        error:
          "Coupon not found",
      },

      {
        status: 404,
      }

    )

  }

  const updated =
    await prisma.coupon.update({

      where: {
        id,
      },

      data: {

        active:
          !coupon.active,

      },

    })

  return NextResponse.json(
    updated
  )

}