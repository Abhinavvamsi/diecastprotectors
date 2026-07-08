import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export async function requireAdmin() {
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  const admin = await prisma.admin.findUnique({
    where: {
      clerkId: user.id,
    },
  })

  if (!admin || !admin.active) {
    redirect("/")
  }

  return {
    user,
    admin,
  }
}

export async function requireOwner() {
  const { user, admin } = await requireAdmin()

  if (admin.role !== "OWNER") {
    redirect("/")
  }

  return {
    user,
    admin,
  }
}