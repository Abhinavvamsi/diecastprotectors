import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

export async function POST(
  req: Request
) {

  try {

    /* Protect API */
    await requireAdmin()

    /* Get Product ID */
    const { searchParams } =
      new URL(req.url)

    const id =
      searchParams.get("id")

    if (!id) {

      return NextResponse.json(

        {
          error: "Missing product id",
        },

        {
          status: 400,
        }

      )

    }

    /* Delete Product */
    await prisma.product.delete({

      where: {
        id,
      },

    })

    /* Success */
    return NextResponse.json({

      success: true,

    })

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {
        error: "Failed to delete product",
      },

      {
        status: 500,
      }

    )

  }

}