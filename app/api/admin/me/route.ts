import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {

  const user = await currentUser()

  if (!user) {
    return NextResponse.json({
      isAdmin: false,
      role: null,
    })
  }

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: user.id,
    },
  })

  if (!admin || !admin.active) {
    return NextResponse.json({
      isAdmin: false,
      role: null,
    })
  }

  return NextResponse.json({
    isAdmin: true,
    role: admin.role,
  })

}