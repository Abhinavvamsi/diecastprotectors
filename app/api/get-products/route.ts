import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const products =
  await prisma.product.findMany({

    include: {
      brand: true,
    },

    orderBy: {
      createdAt: "desc",
    },

  })

  return NextResponse.json(
  products,
  {
    headers: {
      "Cache-Control":
        "no-store",
    },
  }
)

}