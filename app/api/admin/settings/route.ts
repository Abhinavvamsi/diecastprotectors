import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const settings =
    await prisma.storeSettings.findFirst()

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

  if (existing) {

    const updated =
      await prisma.storeSettings.update({

        where: {
          id: existing.id,
        },

        data: {

          shippingCharge:
            body.shippingCharge,

          shippingMessage:
            body.shippingMessage,

          pickupEnabled:
            body.pickupEnabled,

          pickupLocation:
            body.pickupLocation,

        },

      })

    return NextResponse.json(
      updated
    )

  }

  const created =
    await prisma.storeSettings.create({

      data: {

        shippingCharge:
          body.shippingCharge,

        shippingMessage:
          body.shippingMessage,

        pickupEnabled:
          body.pickupEnabled ?? false,

        pickupLocation:
          body.pickupLocation || "",

      },

    })

  return NextResponse.json(
    created
  )

}