import { prisma } from "@/lib/prisma"

import { NextResponse } from "next/server"

import { currentUser } from "@clerk/nextjs/server"

export async function POST(
  req: Request
) {

  try {

    const user =
      await currentUser()

    const isAdmin =
      user?.primaryEmailAddress
        ?.emailAddress ===
      "abhinavvamsi2004@gmail.com"

    if (!isAdmin) {

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )

    }

    const { searchParams } =
      new URL(req.url)

    const id =
      searchParams.get("id")

    if (!id) {

      return NextResponse.json(
        {
          error: "Missing product id",
        },
        {
          status: 400,
        }
      )

    }

    const body =
      await req.json()

    const updatedProduct =
      await prisma.product.update({

        where: {
          id,
        },

        data: {

          name:
            body.name,

          description:
            body.description,

          price:
            body.price,

          images:
            body.images,

          category:
            body.category,

          badge:
            body.badge,

          stock:
            body.stock,

          quantityPricing:
            body.quantityPricing,

        },

      })

    return NextResponse.json(
      updatedProduct
    )

  } catch (error) {

    console.log(error)

    return NextResponse.json(
      {
        error:
          "Failed to update product",
      },
      {
        status: 500,
      }
    )

  }

}