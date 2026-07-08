import { NextResponse } from "next/server"

import { readZipImages } from "@/lib/zip"

import { uploadBuffer } from "@/lib/cloudinary-upload"

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

    const uploaded = []

    for (const image of images) {

      const url =
        await uploadBuffer(

          image.buffer,

          image.name

        )

      uploaded.push({

        name:
          image.name,

        url,

      })

    }

    return NextResponse.json({

      success: true,

      uploaded,

    })

  } catch (error) {

    console.error(error)

    return NextResponse.json({

      error:
        "Upload failed",

    })

  }

}