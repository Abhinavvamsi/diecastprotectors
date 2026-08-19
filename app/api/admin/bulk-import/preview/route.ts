import { NextResponse } from "next/server"
import { requireOwner } from "@/lib/admin"
import { prisma } from "@/lib/prisma"
import { getIndiaDateKey } from "@/lib/preorder"
import {
  normalizeExpectedArrivalCell,
  normalizePreOrderDeadlineCell,
} from "@/lib/bulk-import-dates"

type BulkImportCell =
  | string
  | number
  | boolean
  | null
  | undefined

type BulkImportRow = Record<
  string,
  BulkImportCell
>

type NormalizedBulkImportRow = {
  Name: BulkImportCell
  Description: BulkImportCell
  Price: BulkImportCell
  Stock: BulkImportCell
  Brand: BulkImportCell
  Category: BulkImportCell
  Badge: BulkImportCell
  Image: BulkImportCell
  Deposit?: BulkImportCell
  ExpectedArrival?: BulkImportCell
  PreOrderDeadline?: BulkImportCell
}

function getCell(
  row: BulkImportRow,
  keys: string[]
) {
  for (const key of keys) {
    if (
      row[key] !== undefined &&
      row[key] !== null &&
      String(row[key]).trim() !== ""
    ) {
      return row[key]
    }
  }

  return ""
}

function normalizeRow(
  row: BulkImportRow,
  importType: string
): NormalizedBulkImportRow {
  const normalized = {
    Name: getCell(row, ["Name", "Product Name"]),
    Description: getCell(row, ["Description"]),
    Price: getCell(row, ["Price", "Original Price"]),
    Stock: getCell(row, ["Stock", "Total Stock"]),
    Brand: getCell(row, ["Brand"]),
    Category: getCell(row, ["Category"]),
    Badge: getCell(row, ["Badge"]),
    Image: getCell(row, ["Image", "Image Name"]),
    Deposit:
      getCell(row, [
        "Deposit",
        "Deposit Amount",
        "Deposit % or Amount",
      ]) || 50,
    ExpectedArrival:
      normalizeExpectedArrivalCell(
        getCell(row, [
          "ExpectedArrival",
          "Expected Arrival",
        ])
      ),
    PreOrderDeadline:
      normalizePreOrderDeadlineCell(
        getCell(row, [
          "PreOrderDeadline",
          "Pre Order Deadline",
          "Pre-Order Deadline",
          "Accepting Until",
        ])
      ),
  }

  return importType === "preorder"
    ? {
        ...normalized,
        Category:
          normalized.Category || "Cars",
      }
    : {
        Name: normalized.Name,
        Description: normalized.Description,
        Price: normalized.Price,
        Stock: normalized.Stock,
        Brand: normalized.Brand,
        Category: normalized.Category,
        Badge: normalized.Badge,
        Image: normalized.Image,
      }
}

function hasValue(value: unknown) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  )
}

function looksLikePreOrderRow(
  row: BulkImportRow
) {
  const badge =
    String(row.Badge || "")
      .trim()
      .toLowerCase()

  return (
    hasValue(row.Deposit) ||
    hasValue(row["Deposit Amount"]) ||
    hasValue(row["Deposit % or Amount"]) ||
    hasValue(row.ExpectedArrival) ||
    hasValue(row["Expected Arrival"]) ||
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

    const { rows, importType } =
      await req.json()
    const isPreOrderImport =
      importType === "preorder" ||
      rows.some((row: BulkImportRow) =>
        looksLikePreOrderRow(row)
      )

    if (!Array.isArray(rows)) {

      return NextResponse.json(
        {
          error: "Invalid data.",
        },
        {
          status: 400,
        }
      )

    }

    const brands =
      await prisma.brand.findMany()

    const products =
      await prisma.product.findMany({

        select: {
          name: true,
        },

      })

    const brandNames =
      brands.map((brand) =>
        brand.name.toLowerCase()
      )

    const productNames =
      products.map((product) =>
        product.name.toLowerCase()
      )

    const categories = [

      "Cars",
      "Protectors",

    ]

    const todayKey = getIndiaDateKey()

    const seenNames =
      new Set<string>()

    const validatedRows =
      rows.map((rawRow: BulkImportRow) => {

        const row =
          normalizeRow(
            rawRow,
            isPreOrderImport
              ? "preorder"
              : "regular"
          )

        const errors: string[] = []
        const normalizedName =
          String(row.Name || "")
            .trim()
            .toLowerCase()

        if (!hasValue(row.Name))
          errors.push("Missing product name")

        if (!hasValue(row.Description))
          errors.push("Missing description")

        if (!hasValue(row.Price))
          errors.push("Missing price")

        if (!hasValue(row.Stock))
          errors.push("Missing stock")

        if (!hasValue(row.Brand))
          errors.push("Missing brand")

        if (!hasValue(row.Category))
          errors.push("Missing category")

        if (!hasValue(row.Image))
          errors.push("Missing image")

        if (
          isPreOrderImport &&
          !hasValue(row.ExpectedArrival)
        ) {
          errors.push(
            "Missing expected arrival"
          )
        }

        if (
          row.Brand &&
          !brandNames.includes(
            String(row.Brand)
              .toLowerCase()
          )
        ) {

          errors.push(
            "Brand does not exist"
          )

        }

        if (
          row.Category &&
          !categories.includes(
            String(row.Category)
          )
        ) {

          errors.push(
            "Invalid category"
          )

        }

        if (
          hasValue(row.Price) &&
          Number(row.Price) <= 0
        ) {

          errors.push(
            "Invalid price"
          )

        }

        if (
          hasValue(row.Stock) &&
          Number(row.Stock) < 0
        ) {

          errors.push(
            "Invalid stock"
          )

        }

        if (
          hasValue(row.Stock) &&
          !Number.isInteger(Number(row.Stock))
        ) {
          errors.push(
            "Stock must be a whole number"
          )
        }

        if (
          isPreOrderImport &&
          hasValue(row.Deposit)
        ) {
          const deposit =
            Number(row.Deposit)

          if (
            !Number.isFinite(deposit) ||
            deposit <= 0
          ) {
            errors.push(
              "Invalid deposit"
            )
          }
        }

        if (
          isPreOrderImport &&
          hasValue(row.PreOrderDeadline)
        ) {
          const deadline =
            String(row.PreOrderDeadline)
              .trim()
              .slice(0, 10)

          if (
            !/^\d{4}-\d{2}-\d{2}$/.test(deadline)
          ) {
            errors.push(
              "Deadline must be YYYY-MM-DD"
            )
          } else if (deadline < todayKey) {
            errors.push(
              "Pre-order deadline cannot be in the past"
            )
          }
        }

        if (
          row.Name &&
          productNames.includes(
            String(row.Name)
              .toLowerCase()
          )
        ) {

          errors.push(
            "Product already exists"
          )

        }

        if (
          normalizedName &&
          seenNames.has(normalizedName)
        ) {
          errors.push(
            "Duplicate product in Excel"
          )
        }

        if (normalizedName) {
          seenNames.add(normalizedName)
        }

        return {

          ...row,

          status:
            errors.length === 0
              ? "VALID"
              : "INVALID",

          errors,

        }

      })

    return NextResponse.json({

      rows:
        validatedRows,

      importType:
        isPreOrderImport
          ? "preorder"
          : "regular",

      summary: {

        total:
          validatedRows.length,

        valid:
          validatedRows.filter(
            (r) =>
              r.status === "VALID"
          ).length,

        invalid:
          validatedRows.filter(
            (r) =>
              r.status === "INVALID"
          ).length,

      },

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(

      {
        error:
          "Validation failed.",
      },

      {
        status: 500,
      }

    )

  }

}
