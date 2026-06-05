import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request
) {

  try {

    const {
      code,
      userId,
    } = await req.json()

    const coupon =
      await prisma.coupon.findUnique({

        where: {

          code:
            code.toUpperCase(),

        },

      })

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

    const usedBy =
      (coupon.usedBy as string[]) || []

    if (
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