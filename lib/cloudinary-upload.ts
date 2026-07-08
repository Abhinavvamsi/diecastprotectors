import cloudinary from "@/lib/cloudinary"

export async function uploadBuffer(

  buffer: Buffer,

  fileName: string

): Promise<string> {

  return new Promise(

    (resolve, reject) => {

      const stream =
        cloudinary.uploader.upload_stream(

          {

            folder: "products",

            public_id:
              fileName
                .replace(/\.[^/.]+$/, ""),

            overwrite: true,

          },

          (error, result) => {

            if (error) {

              reject(error)

              return

            }

            resolve(
              result!.secure_url
            )

          }

        )

      stream.end(buffer)

    }

  )

}