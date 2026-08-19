import { NextResponse } from "next/server"
import { requireOwner } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { isFutureSaleLaunch } from "@/lib/sale-launch"
import {
  normalizeExpectedArrivalCell,
  normalizePreOrderDeadlineCell,
} from "@/lib/bulk-import-dates"

type UploadedImage = {
  name: string
  url: string
}

type ImportRow = {
  Name: string
  Description: string
  Price: string | number
  Stock: string | number
  Brand: string
  Category: string
  Badge?: string
  Image: string
  Deposit?: string | number
  ExpectedArrival?: string
  PreOrderDeadline?: string
  "Pre Order Deadline"?: string
  "Pre-Order Deadline"?: string
  "Accepting Until"?: string
  status: "VALID" | "INVALID"
  errors?: string[]
}

type SkippedRow = {
  name: string
  errors: string[]
}

function getDeadline(row: ImportRow) {
  const value =
    row.PreOrderDeadline ||
    row["Pre Order Deadline"] ||
    row["Pre-Order Deadline"] ||
    row["Accepting Until"] ||
    ""

  return normalizePreOrderDeadlineCell(value)
}

function hasValue(value: unknown) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  )
}

function looksLikePreOrderRow(row: ImportRow) {
  const badge =
    String(row.Badge || "")
      .trim()
      .toLowerCase()

  return (
    hasValue(row.Deposit) ||
    hasValue(row.ExpectedArrival) ||
    hasValue(row.PreOrderDeadline) ||
    hasValue(row["Pre Order Deadline"]) ||
    hasValue(row["Pre-Order Deadline"]) ||
    hasValue(row["Accepting Until"]) ||
    badge.includes("pre order") ||
    badge.includes("pre-order")
  )
}

export async function POST(
  req: Request
) {

  await requireOwner()

  try {

    const {
      rows,
      uploadedImages,
      importType,
    } = await req.json()
    const isPreOrderImport =
      importType === "preorder" ||
      rows.some((row: ImportRow) =>
        looksLikePreOrderRow(row)
      )
    const settings =
      await prisma.storeSettings.findFirst({
        select: {
          saleLaunchAt: true,
        },
      })
    const saleHiddenUntil =
      isFutureSaleLaunch(
        settings?.saleLaunchAt
      )
        ? settings?.saleLaunchAt
        : null

    /* Image lookup table */
    const imageMap =
      new Map(
        uploadedImages.map(
          (image: UploadedImage) => [
            image.name.toLowerCase(),
            image.url,
          ]
        )
      )

    const validRows =
      rows.filter(
        (row: ImportRow) =>
          row.status === "VALID"
      )

    const skippedRows: SkippedRow[] =
      rows
        .filter(
          (row: ImportRow) =>
            row.status === "INVALID"
        )
        .map((row: ImportRow) => ({
          name: row.Name,
          errors: row.errors || [],
        }))

    let imported = 0

    const brands =
      await prisma.brand.findMany()

    for (const row of validRows) {

      try {

        /* Brand */

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

        const createdProduct =
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

            isPreOrder:
              isPreOrderImport,

            depositAmount:
              isPreOrderImport
                ? Number(row.Deposit || 50)
                : 50,

            expectedArrival:
              isPreOrderImport
                ? normalizeExpectedArrivalCell(
                    row.ExpectedArrival
                  ) || null
                : null,

            brandId:
              brand.id,

            images: [
              imageUrl,
            ],

            quantityPricing: [],

          },

        })

        if (saleHiddenUntil) {
          await prisma.$executeRaw`
            UPDATE "Product"
            SET "saleHiddenUntil" = ${saleHiddenUntil}
            WHERE id = ${createdProduct.id}
          `
        }

        const preOrderDeadline =
          isPreOrderImport
            ? getDeadline(row)
            : ""

        if (preOrderDeadline) {
          await prisma.$executeRaw`
            UPDATE "Product"
            SET "preOrderDeadline" = ${preOrderDeadline}
            WHERE id = ${createdProduct.id}
          `
        }

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
