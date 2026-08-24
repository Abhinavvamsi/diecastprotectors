import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { NextResponse } from "next/server"
import { isFutureSaleLaunch } from "@/lib/sale-launch"
import { normalizeSiteDiscountPercent } from "@/lib/site-discount"

let storeSettingsExtraColumnsReady = false

function normalizeProductIds(value: unknown) {
  return Array.isArray(value)
    ? value.filter(
        (productId): productId is string =>
          typeof productId === "string"
      )
    : []
}

async function ensureStoreSettingsExtraColumns() {
  if (storeSettingsExtraColumnsReady) return

  await prisma.$executeRaw`
    ALTER TABLE "StoreSettings"
    ADD COLUMN IF NOT EXISTS "preOrderFeaturedProductIds" JSONB
  `

  await prisma.$executeRaw`
    ALTER TABLE "StoreSettings"
    ADD COLUMN IF NOT EXISTS "siteDiscountPercent" INTEGER DEFAULT 0
  `

  await prisma.$executeRaw`
    ALTER TABLE "StoreSettings"
    ADD COLUMN IF NOT EXISTS "siteDiscountEndsAt" TEXT
  `

  storeSettingsExtraColumnsReady = true
}

async function readSettingsExtras(settingsId: string) {
  const rows =
    await prisma.$queryRaw<
      Array<{
        saleLaunchAt: string | null
        preOrderFeaturedProductIds: unknown
        siteDiscountPercent: number | null
        siteDiscountEndsAt: string | null
      }>
    >`
      SELECT "saleLaunchAt", "preOrderFeaturedProductIds", "siteDiscountPercent", "siteDiscountEndsAt"
      FROM "StoreSettings"
      WHERE id = ${settingsId}
      LIMIT 1
    `

  return {
    saleLaunchAt: rows[0]?.saleLaunchAt ?? null,
    preOrderFeaturedProductIds:
      normalizeProductIds(rows[0]?.preOrderFeaturedProductIds),
    siteDiscountPercent:
      normalizeSiteDiscountPercent(rows[0]?.siteDiscountPercent),
    siteDiscountEndsAt:
      rows[0]?.siteDiscountEndsAt ?? null,
  }
}

async function updateSettingsExtras({
  settingsId,
  saleLaunchAt,
  preOrderFeaturedProductIds,
  siteDiscountPercent,
  siteDiscountEndsAt,
}: {
  settingsId: string
  saleLaunchAt: string | null
  preOrderFeaturedProductIds: string[]
  siteDiscountPercent: number
  siteDiscountEndsAt: string | null
}) {
  await prisma.$executeRaw`
    UPDATE "StoreSettings"
    SET
      "saleLaunchAt" = ${saleLaunchAt},
      "preOrderFeaturedProductIds" = CAST(${JSON.stringify(
        preOrderFeaturedProductIds
      )} AS JSONB),
      "siteDiscountPercent" = ${siteDiscountPercent},
      "siteDiscountEndsAt" = ${siteDiscountEndsAt}
    WHERE id = ${settingsId}
  `
}

export async function GET() {
  try {
    await ensureStoreSettingsExtraColumns()

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
  } catch (error) {
    console.error(
      "Admin Settings GET Error:",
      error
    )

    return NextResponse.json(
      {
        shippingCharge: 140,
        shippingMessage: "",
        pickupEnabled: false,
        pickupLocation: "",
        maintenanceMode: false,
        superDealProductIds: [],
        saleLaunchAt: null,
        preOrderFeaturedProductIds: [],
        siteDiscountPercent: 0,
        siteDiscountEndsAt: null,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    )
  }

}

export async function POST(
  req: Request
) {
  try {
    await requireAdmin()
    await ensureStoreSettingsExtraColumns()

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
    const siteDiscountPercent =
      normalizeSiteDiscountPercent(
        body.siteDiscountPercent
      )
    const siteDiscountEndsAt =
      body.siteDiscountEndsAt || null
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
              Number(body.shippingCharge || 0),

            shippingMessage:
              String(body.shippingMessage || ""),

            pickupEnabled:
              Boolean(body.pickupEnabled),

            pickupLocation:
              String(body.pickupLocation || ""),

            maintenanceMode:
              Boolean(body.maintenanceMode),

            superDealProductIds:
              Array.isArray(body.superDealProductIds)
                ? body.superDealProductIds
                : [],

          },

          })

      await updateSettingsExtras({
        settingsId: existing.id,
        saleLaunchAt,
        preOrderFeaturedProductIds,
        siteDiscountPercent,
        siteDiscountEndsAt,
      })

      await syncHiddenSaleProducts()

      const response = NextResponse.json({
        ...updated,
        saleLaunchAt,
        preOrderFeaturedProductIds,
        siteDiscountPercent,
        siteDiscountEndsAt,
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
            Number(body.shippingCharge || 0),

          shippingMessage:
            String(body.shippingMessage || ""),

          pickupEnabled:
            Boolean(body.pickupEnabled),

          pickupLocation:
            String(body.pickupLocation || ""),

          maintenanceMode:
            Boolean(body.maintenanceMode),

          superDealProductIds:
            Array.isArray(body.superDealProductIds)
              ? body.superDealProductIds
              : [],

        },

      })

    await updateSettingsExtras({
      settingsId: created.id,
      saleLaunchAt,
      preOrderFeaturedProductIds,
      siteDiscountPercent,
      siteDiscountEndsAt,
    })

    await syncHiddenSaleProducts()

    const response = NextResponse.json({
      ...created,
      saleLaunchAt,
      preOrderFeaturedProductIds,
      siteDiscountPercent,
      siteDiscountEndsAt,
    })
    response.cookies.set("maintenance-mode", String(Boolean(created.maintenanceMode)), {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error(
      "Admin Settings POST Error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Failed to save settings",
      },
      {
        status: 500,
      }
    )
  }

}
