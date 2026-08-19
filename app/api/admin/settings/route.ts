import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { NextResponse } from "next/server"
import { isFutureSaleLaunch } from "@/lib/sale-launch"

let preOrderFeaturedColumnReady = false

function normalizeProductIds(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (productId): productId is string =>
          typeof productId === "string"
      )
    : []
}

async function ensurePreOrderFeaturedColumn() {
  if (preOrderFeaturedColumnReady) return

  await prisma.$executeRaw`
    ALTER TABLE "StoreSettings"
    ADD COLUMN IF NOT EXISTS "preOrderFeaturedProductIds" JSONB
  `

  preOrderFeaturedColumnReady = true
}

async function readSettingsExtras(settingsId: string) {
  const rows =
    await prisma.$queryRaw<
      Array<{
        saleLaunchAt: string | null
        preOrderFeaturedProductIds: unknown
      }>
    >`
      SELECT "saleLaunchAt", "preOrderFeaturedProductIds"
      FROM "StoreSettings"
      WHERE id = ${settingsId}
      LIMIT 1
    `

  return {
    saleLaunchAt: rows[0]?.saleLaunchAt ?? null,
    preOrderFeaturedProductIds:
      normalizeProductIds(rows[0]?.preOrderFeaturedProductIds),
  }
}

async function updateSettingsExtras({
  settingsId,
  saleLaunchAt,
  preOrderFeaturedProductIds,
}: {
  settingsId: string
  saleLaunchAt: string | null
  preOrderFeaturedProductIds: string[]
}) {
  await prisma.$executeRaw`
    UPDATE "StoreSettings"
    SET
      "saleLaunchAt" = ${saleLaunchAt},
      "preOrderFeaturedProductIds" = CAST(${JSON.stringify(
        preOrderFeaturedProductIds
      )} AS JSONB)
    WHERE id = ${settingsId}
  `
}

export async function GET() {
  await ensurePreOrderFeaturedColumn()

  const settings =
    await prisma.storeSettings.findFirst()
  const extras =
    settings
      ? await readSettingsExtras(settings.id)
      : null

  return NextResponse.json(
    settings
      ? {
          ...settings,
          ...extras,
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
  await ensurePreOrderFeaturedColumn()

  const body =
    await req.json()

  const existing =
    await prisma.storeSettings.findFirst()
  const saleLaunchAt =
    body.saleLaunchAt || null
  const preOrderFeaturedProductIds =
    normalizeProductIds(
      body.preOrderFeaturedProductIds
    )
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

        },

        })

    await updateSettingsExtras({
      settingsId: existing.id,
      saleLaunchAt,
      preOrderFeaturedProductIds,
    })

    await syncHiddenSaleProducts()

    const response = NextResponse.json({
      ...updated,
      saleLaunchAt,
      preOrderFeaturedProductIds,
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

      },

    })

  await updateSettingsExtras({
    settingsId: created.id,
    saleLaunchAt,
    preOrderFeaturedProductIds,
  })

  await syncHiddenSaleProducts()

  const response = NextResponse.json({
    ...created,
    saleLaunchAt,
    preOrderFeaturedProductIds,
  })
  response.cookies.set("maintenance-mode", String(Boolean(created.maintenanceMode)), {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  })

  return response

}
