import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const email =
    user.primaryEmailAddress?.emailAddress

  if (email !== "abhinavvamsi2004@gmail.com") {
    return NextResponse.json(
      { error: "Only the owner can run setup." },
      { status: 403 }
    )
  }

  await prisma.admin.upsert({
    where: {
      clerkId: user.id,
    },
    update: {
      email,
      role: "OWNER",
      active: true,
    },
    create: {
      clerkId: user.id,
      email: email!,
      role: "OWNER",
      active: true,
    },
  })

  return NextResponse.json({
    success: true,
    message: "Owner account created successfully.",
  })
}