import { NextResponse } from "next/server"
import { readZipImages } from "@/lib/zip"

export async function POST(
  req: Request
) {

  try {

    const formData =
      await req.formData()

    const zip =
      formData.get("zip") as File

    if (!zip) {

      return NextResponse.json({

        error:
          "ZIP missing",

      })

    }

    const buffer =
      Buffer.from(
        await zip.arrayBuffer()
      )

    const images =
      readZipImages(buffer)

    return NextResponse.json({

      count:
        images.length,

      files:
        images.map(
          (img) => img.name
        ),

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json({

      error:
        "Failed",

    })

  }

}