import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request
) {

  try {

    const {
      code,
      userId,
      total,
    } = await req.json()

    const coupon =
  await prisma.coupon.findUnique({

    where: {
      code:
        code.toUpperCase(),
    },

  })

console.log(
  "Coupon From DB:",
  coupon
)

    if (!coupon) {

      return NextResponse.json({

        valid: false,

        message:
          "Coupon not found",

      })

    }

    if (!coupon.active) {

      return NextResponse.json({

        valid: false,

        message:
          "Coupon inactive",

      })

    }

    if (
      coupon.minOrder &&
      total < coupon.minOrder
    ) {

      return NextResponse.json({

        valid: false,

        message:
          `Minimum order ₹${coupon.minOrder} required`,

      })

    }

    const usedBy =
      (coupon.usedBy as string[]) || []

    if (
      userId &&
      usedBy.includes(userId)
    ) {

      return NextResponse.json({

        valid: false,

        message:
          "Coupon already used",

      })

    }

    return NextResponse.json({

      valid: true,

      coupon,

    })

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {

        valid: false,

        message:
          "Something went wrong",

      },

      {

        status: 500,

      }

    )

  }

}