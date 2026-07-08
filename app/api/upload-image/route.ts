import cloudinary from "@/lib/cloudinary"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"

export async function POST(
  req: Request
) {

  try {

    /* Protect API */
    await requireAdmin()

    /* Get File */
    const formData =
      await req.formData()

    const file =
      formData.get("file") as File

    if (!file) {

      return NextResponse.json(

        {
          error: "No file uploaded",
        },

        {
          status: 400,
        }

      )

    }

    /* Convert File */
    const bytes =
      await file.arrayBuffer()

    const buffer =
      Buffer.from(bytes)

    const base64 =
      `data:${file.type};base64,${buffer.toString("base64")}`

    /* Upload to Cloudinary */
    const uploadedImage =
      await cloudinary.uploader.upload(

        base64,

        {
          folder: "hw-shield",
        }

      )

    return NextResponse.json({

      imageUrl:
        uploadedImage.secure_url,

    })

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {
        error: "Image upload failed",
      },

      {
        status: 500,
      }

    )

  }

}