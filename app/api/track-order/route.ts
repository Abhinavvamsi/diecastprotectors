import { prisma } from "@/lib/prisma"

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(
  req: Request
) {

  try {

    const {
      searchParams,
    } = new URL(req.url)

    const orderId =
      searchParams.get(
        "orderId"
      )

    if (!orderId) {

      return NextResponse.json(
        {
          error:
            "Missing order ID",
        },
        {
          status: 400,
        }
      )

    }

    const order =
      await prisma.order.findFirst({

        where: {
          orderId,
        },

      })

    if (!order) {

      return NextResponse.json(
        {
          error:
            "Order not found",
        },
        {
          status: 404,
        }
      )

    }

    return NextResponse.json(
      order,
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    )

  } catch (error) {

    return NextResponse.json(
      {
        error:
          "Failed to track order",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    )

  }

}
