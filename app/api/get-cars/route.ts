import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {

  const products =
    await prisma.product.findMany({

      where: {
        category: "Cars",
        isPreOrder: false,
      },

      include: {
        brand: true,
      },

      orderBy: {
        createdAt: "desc",
      },

    })

  return NextResponse.json(
    products.map((product) => ({
      ...product,
      stock: Math.max(
        0,
        product.stock - product.reservedStock
      ),
    }))
  )

}
