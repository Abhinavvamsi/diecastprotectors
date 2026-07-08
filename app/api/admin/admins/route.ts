import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import { requireOwner } from "@/lib/admin"

export async function GET() {

  await requireOwner()

  const admins =
    await prisma.admin.findMany({

      orderBy: {
        createdAt: "asc",
      },

    })

  return NextResponse.json(admins)

}

export async function POST(
  req: Request
) {

  await requireOwner()

  const body =
    await req.json()

  const email =
    body.email
      ?.trim()
      .toLowerCase()

  if (!email) {

    return NextResponse.json(

      {
        error: "Email is required",
      },

      {
        status: 400,
      }

    )

  }

  const clerk =
    await clerkClient()

  const users =
    await clerk.users.getUserList({

      emailAddress: [email],

    })

  const user =
    users.data[0]

  if (!user) {

    return NextResponse.json(

      {
        error:
          "No Clerk user found with this email.",
      },

      {
        status: 404,
      }

    )

  }

  const existing =
    await prisma.admin.findUnique({

      where: {
        clerkId: user.id,
      },

    })

  if (existing) {

    return NextResponse.json(

      {
        error:
          "User is already an admin.",
      },

      {
        status: 400,
      }

    )

  }

  const primaryEmail =
    user.emailAddresses.find(

      (e) =>
        e.id ===
        user.primaryEmailAddressId

    )?.emailAddress ?? email

  const admin =
    await prisma.admin.create({

      data: {

        clerkId: user.id,

        email: primaryEmail,

        role: "ADMIN",

        active: true,

      },

    })

  return NextResponse.json(admin)

}