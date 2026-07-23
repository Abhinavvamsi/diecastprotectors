import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const settings =
    await prisma.storeSettings.findFirst()

  return NextResponse.json(
    settings,
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
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

          maintenanceMode:
            body.maintenanceMode ?? false,

          superDealProductIds:
            body.superDealProductIds ?? [],

        } as any,

        })

    const response = NextResponse.json(updated)
    response.cookies.set("maintenance-mode", String(Boolean(updated.maintenanceMode)), {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    })

    return response

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

        maintenanceMode:
          body.maintenanceMode ?? false,

        superDealProductIds:
          body.superDealProductIds ?? [],

      } as any,

    })

  const response = NextResponse.json(created)
  response.cookies.set("maintenance-mode", String(Boolean(created.maintenanceMode)), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  })

  return response

}
