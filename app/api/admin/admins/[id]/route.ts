import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/admin"

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(
  req: Request,
  { params }: Props
) {

  await requireOwner()

  const { id } = await params

  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
  })

  if (!admin) {
    return NextResponse.json(
      {
        error: "Admin not found",
      },
      {
        status: 404,
      }
    )
  }

  // Owner can never be disabled
  if (admin.role === "OWNER") {
    return NextResponse.json(
      {
        error: "Owner account cannot be disabled.",
      },
      {
        status: 400,
      }
    )
  }

  const updated = await prisma.admin.update({
    where: {
      id,
    },
    data: {
      active: !admin.active,
    },
  })

  return NextResponse.json(updated)

}

export async function DELETE(
  req: Request,
  { params }: Props
) {

  const { admin: currentAdmin } =
    await requireOwner()

  const { id } = await params

  const admin = await prisma.admin.findUnique({
    where: {
      id,
    },
  })

  if (!admin) {
    return NextResponse.json(
      {
        error: "Admin not found",
      },
      {
        status: 404,
      }
    )
  }

  // Cannot delete yourself
  if (admin.id === currentAdmin.id) {
    return NextResponse.json(
      {
        error: "You cannot delete yourself.",
      },
      {
        status: 400,
      }
    )
  }

  // Owner can never be deleted
  if (admin.role === "OWNER") {
    return NextResponse.json(
      {
        error: "Owner account cannot be deleted.",
      },
      {
        status: 400,
      }
    )
  }

  await prisma.admin.delete({
    where: {
      id,
    },
  })

  return NextResponse.json({
    success: true,
  })

}