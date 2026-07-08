import { NextResponse } from "next/server"
import { requireOwner } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request
) {

  await requireOwner()

  try {

    const {
      rows,
      uploadedImages,
    } = await req.json()

    /* Image lookup table */
    const imageMap =
      new Map(
        uploadedImages.map(
          (image: any) => [
            image.name.toLowerCase(),
            image.url,
          ]
        )
      )

    const validRows =
      rows.filter(
        (row: any) =>
          row.status === "VALID"
      )

    const skippedRows: any[] =
      rows
        .filter(
          (row: any) =>
            row.status === "INVALID"
        )
        .map((row: any) => ({
          name: row.Name,
          errors: row.errors,
        }))

    let imported = 0

    for (const row of validRows) {

      try {

        /* Brand */

        const brands =
  await prisma.brand.findMany()

const brand =
  brands.find(

    (b) =>

      b.name
        .trim()
        .toLowerCase() ===

      String(row.Brand)
        .trim()
        .toLowerCase()

  )

        if (!brand) {

          skippedRows.push({

            name: row.Name,

            errors: [
              "Brand does not exist",
            ],

          })

          continue

        }

        /* Image */
console.log("========== IMPORT ==========")
console.log("Rows:", rows)
console.log("Uploaded Images:", uploadedImages)
        const imageUrl =
          imageMap.get(
            row.Image
              ?.toLowerCase()
          )

        if (!imageUrl) {

          skippedRows.push({

            name: row.Name,

            errors: [
              "Image not found in ZIP",
            ],

          })

          continue

        }

        /* Prevent duplicates */

        const existing =
          await prisma.product.findFirst({

            where: {
              name: row.Name,
            },

          })

        if (existing) {

          skippedRows.push({

            name: row.Name,

            errors: [
              "Product already exists",
            ],

          })

          continue

        }

        /* Create Product */

        await prisma.product.create({

          data: {

            name: row.Name,

            description:
              row.Description,

            price:
              Number(row.Price),

            stock:
              Number(row.Stock),

            category:
              row.Category,

            badge:
              row.Badge || "",

            brandId:
              brand.id,

            images: [
              imageUrl,
            ],

            quantityPricing: [],

          },

        })

        imported++

      } catch (error) {

        console.error(
          "Failed to import:",
          row.Name,
          error
        )

        skippedRows.push({

          name: row.Name,

          errors: [
            "Unexpected error",
          ],

        })

      }

    }

    return NextResponse.json({

      success: true,

      imported,

      skipped:
        skippedRows.length,

      skippedRows,

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(

      {
        error:
          "Import failed.",
      },

      {
        status: 500,
      }

    )

  }

}