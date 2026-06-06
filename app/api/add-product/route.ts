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
    const body =
      await req.json()

    const product =
      await prisma.product.create({

        data: {

          name: body.name,

  description: body.description,

  price: body.price,

  images: body.images,

  category: body.category,

  badge: body.badge,

  stock: body.stock,

  quantityPricing:

    body.quantityPricing || null,
        },

      })

    return NextResponse.json(
      product
    )

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {
        error:
          "Failed to add product",
      },

      {
        status: 500,
      }

    )

  }

}