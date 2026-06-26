import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  req: NextRequest,
  { params }: Props
) {
  const { id } = await params

  const banner = await prisma.banner.findUnique({
    where: { id },
  })

  if (!banner) {
    return NextResponse.json(
      { error: "Banner not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(banner)
}

export async function PUT(
  req: NextRequest,
  { params }: Props
) {
  const { id } = await params

  const body = await req.json()

  const banner = await prisma.banner.update({
    where: { id },
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
}

export async function DELETE(
  req: NextRequest,
  { params }: Props
) {
  const { id } = await params

  await prisma.banner.delete({
    where: { id },
  })

  return NextResponse.json({
    success: true,
  })
}