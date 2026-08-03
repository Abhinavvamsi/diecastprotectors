import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { getIndiaDateKey } from "@/lib/preorder"
import { isFutureSaleLaunch } from "@/lib/sale-launch"

export async function POST(
  req: Request
) {

  try {

    await requireAdmin()

    const body =
      await req.json()
    const productName =
      String(body.name || "").trim()
    const productDescription =
      String(body.description || "").trim()

    if (
      body.preOrderDeadline &&
      body.preOrderDeadline < getIndiaDateKey()
    ) {
      return NextResponse.json(
        {
          error: "Pre-order deadline cannot be in the past",
        },
        {
          status: 400,
        }
      )
    }

    const matchingProducts =
      await prisma.$queryRaw<
        Array<{
          id: string
        }>
      >`
        SELECT id
        FROM "Product"
        WHERE LOWER(TRIM(name)) = LOWER(${productName})
        LIMIT 1
      `

    if (matchingProducts.length > 0) {
      return NextResponse.json(
        {
          error: "A product with this name already exists",
        },
        {
          status: 409,
        }
      )
    }

    const settings =
      await prisma.$queryRaw<
        Array<{
          saleLaunchAt: string | null
        }>
      >`
        SELECT "saleLaunchAt"
        FROM "StoreSettings"
        LIMIT 1
      `
    const saleHiddenUntil =
      isFutureSaleLaunch(settings[0]?.saleLaunchAt)
        ? settings[0]?.saleLaunchAt
        : null

    const product =
      await prisma.$transaction(async (tx) => {
        const createdProduct =
          await tx.product.create({

          data: {

            name: productName,

            description: productDescription,

            price: body.price,

            images: body.images,

            category: body.category,

            badge: body.badge,

            isPreOrder: body.isPreOrder ?? false,

            depositAmount: Number(body.depositAmount ?? 50),

            expectedArrival: body.expectedArrival || null,
		
            stock: body.stock,

            brandId: body.brandId,

            quantityPricing:
              body.quantityPricing || null,

          },

        })

        if (saleHiddenUntil) {
          await tx.$executeRaw`
            UPDATE "Product"
            SET "saleHiddenUntil" = ${saleHiddenUntil}
            WHERE id = ${createdProduct.id}
          `
        }

        if (body.preOrderDeadline) {
          await tx.$executeRaw`
            UPDATE "Product"
            SET "preOrderDeadline" = ${body.preOrderDeadline}
            WHERE id = ${createdProduct.id}
          `
        }

        return {
          ...createdProduct,
          saleHiddenUntil,
          preOrderDeadline:
            body.preOrderDeadline || null,
        }
      })

    return NextResponse.json(product)

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {
        error: "Failed to add product",
      },

      {
        status: 500,
      }

    )

  }

}
