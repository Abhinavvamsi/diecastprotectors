import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function safeReadJson(
  req: Request
) {
  try {
    const text = await req.text()

    if (!text.trim()) {
      return null
    }

    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function POST(
  req: Request
) {

  try {

    const body =
      await safeReadJson(req)

    const code =
      typeof body?.code === "string"
        ? body.code.trim()
        : ""

    const userId =
      typeof body?.userId === "string"
        ? body.userId
        : ""

    const total =
      Number(body?.total || 0)

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "Enter a coupon code",
        },
        {
          status: 400,
        }
      )
    }

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

    console.error(
      "Validate Coupon Error:",
      error
    )

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
