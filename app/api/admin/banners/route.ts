import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,

        images: {
          desktop: body.image,
          mobile: body.mobileImage,
        },

        buttonText: body.buttonText,
        buttonLink: body.buttonLink,

        order: body.order,
        active: body.active,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    )
  }
}