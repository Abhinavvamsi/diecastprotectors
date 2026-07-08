"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
export default function BulkImportForm() {

  const [excelFile, setExcelFile] =
    useState<File | null>(null)

  const [zipFile, setZipFile] =
    useState<File | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [preview, setPreview] =
    useState<any[]>([])

  const [summary, setSummary] =
  useState<any>(null)

  const [importing, setImporting] =
  useState(false)

const [uploadedImages, setUploadedImages] =
  useState<
    {
      name: string
      url: string
    }[]
  >([])
const [progress, setProgress] =
  useState(0)

const [progressText, setProgressText] =
  useState("")

const [showSummary, setShowSummary] =
  useState(false)

const [importResult, setImportResult] =
  useState<any>(null)



async function testZip() {

  if (!zipFile) return

  const formData = new FormData()

  formData.append(
    "zip",
    zipFile
  )

  const response = await fetch(
    "/api/admin/test-zip",
    {
      method: "POST",
      body: formData,
    }
  )

  const data = await response.json()

  console.log(data)

  alert(
    `ZIP contains ${data.count} images.\n\n${data.files.join("\n")}`
  )

}



async function testCloudinary() {

  if (!zipFile) return

  const formData = new FormData()

  formData.append(
    "zip",
    zipFile
  )

  const response = await fetch(
    "/api/admin/test-cloudinary",
    {
      method: "POST",
      body: formData,
    }
  )

  const data = await response.json()

  console.log(data)

  if (!response.ok) {

    alert(data.error)

    return

  }

  alert(
    `Successfully uploaded ${data.uploaded.length} images to Cloudinary.`
  )

}


  async function previewImport() {

  if (!excelFile) return

  try {

    setLoading(true)

    const buffer =
      await excelFile.arrayBuffer()

    const workbook =
      XLSX.read(buffer)

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ]

    const rows =
      XLSX.utils.sheet_to_json(sheet)


    const response =
      await fetch(
        "/api/admin/bulk-import/preview",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

          },

          body: JSON.stringify({

            rows,

          }),

        }
      )

    const data =
      await response.json()

    if (!response.ok) {

  console.error(data.error)

  return

}

    setPreview(data.rows)
    setSummary(data.summary)

  } finally {

    setLoading(false)

  }

}
async function importProducts() {

  try {

    setImporting(true)
    setProgress(5)
setProgressText("Preparing import...")
const zipData =
  new FormData()

zipData.append(
  "zip",
  zipFile!
)
setProgress(20)
setProgressText("Uploading images...")
const uploadResponse =
  await fetch(
    "/api/admin/test-cloudinary",
    {

      method: "POST",

      body: zipData,

    }
  )

const uploadResult =
  await uploadResponse.json()

if (!uploadResponse.ok) {

  alert(
    uploadResult.error
  )

  return

}

setUploadedImages(
  uploadResult.uploaded
)
setProgress(60)
setProgressText("Images uploaded successfully")
setProgress(75)
setProgressText("Creating products...")
    const response =
      await fetch(
        "/api/admin/bulk-import/import",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

  rows: preview,

  uploadedImages:
    uploadResult.uploaded,

}),

        }
      )

    const data =
      await response.json()
setProgress(100)
setProgressText("Import completed 🎉")
    if (!response.ok) {

      alert(data.error)

      return

    }

    setImportResult(data)

setShowSummary(true)

  } finally {

    setTimeout(() => {

  setImporting(false)

  setProgress(0)

  setProgressText("")

}, 1500)

  }

}

  return (

    <div className="space-y-8">

      {/* Excel Upload */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold mb-4">
          Upload Excel File
        </h2>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) =>
            setExcelFile(
              e.target.files?.[0] || null
            )
          }
        />

        {excelFile && (

          <p className="mt-4 text-green-400">

            ✓ {excelFile.name}

          </p>

        )}

      </div>

      {/* ZIP Upload */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold mb-4">
          Upload Images ZIP
        </h2>

        <input
          type="file"
          accept=".zip"
          onChange={(e) =>
            setZipFile(
              e.target.files?.[0] || null
            )
          }
        />

        {zipFile && (

          <p className="mt-4 text-green-400">

            ✓ {zipFile.name}

          </p>

        )}

      </div>

      {/* Preview Button */}

      <button
        onClick={previewImport}
        disabled={
  !excelFile ||
  loading
}
        className="
        h-14
        px-8
        rounded-2xl
        bg-gradient-to-r
        from-pink-500
        via-fuchsia-500
        to-purple-600
        text-white
        font-semibold
        hover:scale-105
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        "
      >

        {loading
          ? "Generating Preview..."
          : "Preview Import"}

      </button>


{summary && (

  <div className="grid md:grid-cols-3 gap-6 mb-8">

    <div className="bg-zinc-900 rounded-2xl p-6">

      <h2 className="text-3xl font-bold">

        {summary.total}

      </h2>

      <p className="text-zinc-400">

        Total Products

      </p>

    </div>

    <div className="bg-green-950 rounded-2xl p-6">

      <h2 className="text-3xl font-bold text-green-400">

        {summary.valid}

      </h2>

      <p>

        Ready to Import

      </p>

    </div>

    <div className="bg-red-950 rounded-2xl p-6">

      <h2 className="text-3xl font-bold text-red-400">

        {summary.invalid}

      </h2>

      <p>

        Validation Errors

      </p>

    </div>

  </div>

)}

{importing && (

  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

    <div className="flex justify-between items-center mb-4">

      <h2 className="text-xl font-bold">

        Import Progress

      </h2>

      <span className="text-pink-400 font-bold">

        {progress}%

      </span>

    </div>

    <div className="w-full h-4 rounded-full bg-zinc-800 overflow-hidden">

      <div

        style={{
          width: `${progress}%`,
        }}

        className="
        h-full
        bg-gradient-to-r
        from-pink-500
        via-fuchsia-500
        to-purple-600
        transition-all
        duration-500
        "

      />

    </div>

    <p className="mt-4 text-zinc-300">

      {progressText}

    </p>

  </div>

)}
      {/* Preview Table */}

      {preview.length > 0 && (

        <div
          className="
          mt-10
          bg-zinc-950
          rounded-3xl
          border
          border-zinc-800
          overflow-auto
          "
        >

          <table className="w-full">

            <thead>

              <tr className="border-b border-zinc-800">

                {Object.keys(preview[0]).map((key) => (

                  <th
                    key={key}
                    className="
                    text-left
                    px-5
                    py-4
                    font-semibold
                    "
                  >

                    {key}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

             {preview.map((row, index) => (

  <tr
    key={index}
    className="border-b border-zinc-900"
  >

    <td className="px-5 py-4">
      {row.Name || (
        <span className="text-red-400">
          Not Filled
        </span>
      )}
    </td>

    <td className="px-5 py-4">
      {row.Description || (
        <span className="text-red-400">
          Not Filled
        </span>
      )}
    </td>

    <td className="px-5 py-4">
      {row.Price !== undefined &&
       row.Price !== ""
        ? row.Price
        : (
          <span className="text-red-400">
            Not Filled
          </span>
        )}
    </td>

    <td className="px-5 py-4">
      {row.Stock !== undefined &&
       row.Stock !== ""
        ? row.Stock
        : (
          <span className="text-red-400">
            Not Filled
          </span>
        )}
    </td>

    <td className="px-5 py-4">
      {row.Brand || (
        <span className="text-red-400">
          Not Filled
        </span>
      )}
    </td>

    <td className="px-5 py-4">
      {row.Category || (
        <span className="text-red-400">
          Not Filled
        </span>
      )}
    </td>

    <td className="px-5 py-4">
      {row.Badge || "-"}
    </td>

    <td className="px-5 py-4">
      {row.Image || (
        <span className="text-red-400">
          Not Filled
        </span>
      )}
    </td>

    <td className="px-5 py-4">

      {row.status === "VALID" ? (

        <span className="px-3 py-1 rounded-full bg-green-600/20 text-green-400">
          VALID
        </span>

      ) : (

        <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400">
          INVALID
        </span>

      )}

    </td>

    <td className="px-5 py-4">

      {row.errors.length === 0
        ? "-"
        : (
          <ul className="space-y-1">

            {row.errors.map(
              (error: string, i: number) => (

                <li
                  key={i}
                  className="text-red-400"
                >

                  • {error}

                </li>

              )
            )}

          </ul>
        )}

    </td>

  </tr>

))}

            </tbody>

          </table>

        </div>

      )}
{preview.length > 0 && (

  <div className="mt-10 flex flex-col items-end gap-3">

    <button
      onClick={importProducts}
     disabled={
  importing ||
  !summary?.valid
}
      className="
      h-14
      px-8
      rounded-2xl
      bg-gradient-to-r
      from-green-500
      to-emerald-600
      text-white
      font-bold
      hover:scale-105
      transition-all
      disabled:opacity-50
      disabled:cursor-not-allowed
      "
    >

      {importing
  ? "Importing Valid Products..."
  : `Import ${summary?.valid ?? 0} Valid Product${summary?.valid === 1 ? "" : "s"}`}

    </button>

   {summary?.invalid > 0 && (

  <p className="text-yellow-400 text-sm">

    {summary.invalid} invalid product{summary.invalid === 1 ? "" : "s"} will be skipped automatically.

  </p>

)}

  </div>

)}
{showSummary && importResult && (

<div
className="
fixed
inset-0
z-50
bg-black/70
backdrop-blur-sm
flex
items-center
justify-center
p-6
"
>

<div
className="
w-full
max-w-2xl
bg-zinc-900
border
border-zinc-800
rounded-3xl
p-8
shadow-2xl
"
>

<div className="text-center">

<div className="text-6xl mb-4">

🎉

</div>

<h2 className="text-4xl font-bold">

Import Completed

</h2>

<p className="text-zinc-400 mt-3">

Your products have been imported successfully.

</p>

</div>

<div className="grid grid-cols-2 gap-5 mt-10">

<div className="rounded-2xl bg-green-950 p-6 text-center">

<h3 className="text-5xl font-bold text-green-400">

{importResult.imported}

</h3>

<p className="mt-2">

Imported

</p>

</div>

<div className="rounded-2xl bg-yellow-950 p-6 text-center">

<h3 className="text-5xl font-bold text-yellow-400">

{importResult.skipped}

</h3>

<p className="mt-2">

Skipped

</p>

</div>

</div>

{importResult.skippedRows?.length > 0 && (

<div
className="
mt-8
rounded-2xl
border
border-zinc-800
bg-zinc-950
max-h-60
overflow-y-auto
"
>

<table className="w-full">

<thead>

<tr className="border-b border-zinc-800">

<th className="px-4 py-3 text-left">

Product

</th>

<th className="px-4 py-3 text-left">

Reason

</th>

</tr>

</thead>

<tbody>

{importResult.skippedRows.map(

(row:any,index:number)=>(

<tr
key={index}
className="border-b border-zinc-800"
>

<td className="px-4 py-3">

{row.name}

</td>

<td className="px-4 py-3 text-red-400">

{row.errors.join(", ")}

</td>

</tr>

)

)}

</tbody>

</table>

</div>

)}

<div className="flex justify-end mt-8">

<button

onClick={() => {

setShowSummary(false)

}}

className="
h-12
px-8
rounded-xl
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
font-semibold
hover:scale-105
transition
"

>

Done

</button>

</div>

</div>

</div>

)}
    </div>

  )

}