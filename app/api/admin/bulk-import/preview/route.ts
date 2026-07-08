import { NextResponse } from "next/server"
import { requireOwner } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request
) {

  await requireOwner()

  try {

    const { rows } =
      await req.json()

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

    const validatedRows =
      rows.map((row: any) => {

        const errors: string[] = []

        if (!row.Name)
          errors.push("Missing product name")

        if (!row.Description)
          errors.push("Missing description")

        if (!row.Price)
          errors.push("Missing price")

        if (!row.Stock)
          errors.push("Missing stock")

        if (!row.Brand)
          errors.push("Missing brand")

        if (!row.Category)
          errors.push("Missing category")

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
            row.Category
          )
        ) {

          errors.push(
            "Invalid category"
          )

        }

        if (
          row.Price &&
          Number(row.Price) <= 0
        ) {

          errors.push(
            "Invalid price"
          )

        }

        if (
          row.Stock &&
          Number(row.Stock) < 0
        ) {

          errors.push(
            "Invalid stock"
          )

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