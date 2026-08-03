import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { NextResponse } from "next/server"
import { isFutureSaleLaunch } from "@/lib/sale-launch"

export async function GET() {

  const settings =
    await prisma.storeSettings.findFirst()
  const saleSettings =
    settings
      ? await prisma.$queryRaw<
          Array<{
            saleLaunchAt: string | null
          }>
        >`
          SELECT "saleLaunchAt"
          FROM "StoreSettings"
          WHERE id = ${settings.id}
          LIMIT 1
        `
      : []

  return NextResponse.json(
    settings
      ? {
          ...settings,
          saleLaunchAt:
            saleSettings[0]?.saleLaunchAt ?? null,
        }
      : settings,
    {
      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    }
  )

}

export async function POST(
  req: Request
) {
  await requireAdmin()

  const body =
    await req.json()

  const existing =
    await prisma.storeSettings.findFirst()
  const saleLaunchAt =
    body.saleLaunchAt || null
  const now = new Date().toISOString()

  async function syncHiddenSaleProducts() {
    if (isFutureSaleLaunch(saleLaunchAt)) {
      await prisma.$executeRaw`
        UPDATE "Product"
        SET "saleHiddenUntil" = ${saleLaunchAt}
        WHERE "saleHiddenUntil" IS NOT NULL
          AND "saleHiddenUntil" > ${now}
      `
      return
    }

    await prisma.$executeRaw`
      UPDATE "Product"
      SET "saleHiddenUntil" = NULL
      WHERE "saleHiddenUntil" IS NOT NULL
        AND "saleHiddenUntil" > ${now}
    `
  }

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

    await prisma.$executeRaw`
      UPDATE "StoreSettings"
      SET "saleLaunchAt" = ${saleLaunchAt}
      WHERE id = ${existing.id}
    `

    await syncHiddenSaleProducts()

    const response = NextResponse.json({
      ...updated,
      saleLaunchAt,
    })
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

  await prisma.$executeRaw`
    UPDATE "StoreSettings"
    SET "saleLaunchAt" = ${saleLaunchAt}
    WHERE id = ${created.id}
  `

  await syncHiddenSaleProducts()

  const response = NextResponse.json({
    ...created,
    saleLaunchAt,
  })
  response.cookies.set("maintenance-mode", String(Boolean(created.maintenanceMode)), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  })

  return response

}
