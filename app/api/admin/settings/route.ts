import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  let settings =
    await prisma.storeSettings.findFirst()

  if (!settings) {

    settings =
      await prisma.storeSettings.create({

        data: {

          shippingCharge: 49,

          shippingMessage:
            "Flat shipping across India",

        },

      })

  }

  return NextResponse.json(
    settings
  )

}

export async function POST(
  req: Request
) {

  const body =
    await req.json()

  const existing =
    await prisma.storeSettings.findFirst()

  if (!existing) {

    const settings =
      await prisma.storeSettings.create({

        data: {

          shippingCharge:
            body.shippingCharge,

          shippingMessage:
            body.shippingMessage,

        },

      })

    return NextResponse.json(
      settings
    )

  }

  const settings =
    await prisma.storeSettings.update({

      where: {
        id: existing.id,
      },

      data: {

        shippingCharge:
          body.shippingCharge,

        shippingMessage:
          body.shippingMessage,

      },

    })

  return NextResponse.json(
    settings
  )

}