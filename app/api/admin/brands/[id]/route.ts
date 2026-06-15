import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  }
) {

  try {

    const { id } =
      await params

    const brand =
      await prisma.brand.findUnique({

        where: {
          id,
        },

        include: {
          products: true,
        },

      })

    if (!brand) {

      return NextResponse.json(

        {
          error:
            "Brand not found",
        },

        {
          status: 404,
        }

      )

    }

    if (
      brand.products.length > 0
    ) {

      return NextResponse.json(

        {
          error:
            `Cannot delete brand. ${brand.products.length} products are still assigned to it.`,
        },

        {
          status: 400,
        }

      )

    }

    await prisma.brand.delete({

      where: {
        id,
      },

    })

    return NextResponse.json({

      success: true,

      message:
        "Brand deleted successfully",

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(

      {
        error:
          "Failed to delete brand",
      },

      {
        status: 500,
      }

    )

  }

}