import { NextResponse } from "next/server"
import { requireOwner } from "@/lib/admin"

export async function POST(req: Request) {

  await requireOwner()

  try {

    const formData =
      await req.formData()

    const excel =
      formData.get("excel") as File

    const zip =
      formData.get("zip") as File

    if (!excel || !zip) {

      return NextResponse.json(
        {
          error: "Excel and ZIP are required.",
        },
        {
          status: 400,
        }
      )

    }

    return NextResponse.json({

      success: true,

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "Import failed.",
      },
      {
        status: 500,
      }
    )

  }

}