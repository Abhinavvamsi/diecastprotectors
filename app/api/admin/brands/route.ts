import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const brands =
    await prisma.brand.findMany({

      include: {

        _count: {

          select: {

            products: true,

          },

        },

      },

      orderBy: {

        name: "asc",

      },

    })

  return NextResponse.json(
    brands
  )

}

export async function POST(
  request: Request
) {

  const body =
    await request.json()

  const brand =
    await prisma.brand.create({

      data: {

        name: body.name,

        logo: body.logo,

      },

    })

  return NextResponse.json(
    brand
  )

}