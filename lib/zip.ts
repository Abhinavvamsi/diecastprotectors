import AdmZip from "adm-zip"

export interface ZipImage {

  name: string

  buffer: Buffer

}

export function readZipImages(
  zipBuffer: Buffer
): ZipImage[] {

  const zip =
    new AdmZip(zipBuffer)

  const entries =
    zip.getEntries()

  return entries

    .filter((entry) => {

  if (entry.isDirectory) {
    return false
  }

  const name =
    entry.entryName
      .split("/")
      .pop()!
      .toLowerCase()

  if (name.startsWith("._")) {
    return false
  }

  if (name === ".ds_store") {
    return false
  }

  return true

})

    .map((entry) => ({

      name:
        entry.entryName
          .split("/")
          .pop()!
          .toLowerCase(),

      buffer:
        entry.getData(),

    }))

}

export function findImage(

  images: ZipImage[],

  fileName: string

) {

  return images.find(

    (image) =>

      image.name ===

      fileName.toLowerCase()

  )

}