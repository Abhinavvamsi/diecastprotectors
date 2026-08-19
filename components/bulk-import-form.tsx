"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import * as XLSX from "xlsx"

type ImportType =
  | "regular"
  | "preorder"

type PreviewCell =
  | string
  | number
  | boolean
  | null
  | undefined

type PreviewRow = Record<
  string,
  PreviewCell | string[]
> & {
  status?: "VALID" | "INVALID"
  errors?: string[]
}

type ImportResult = {
  imported: number
  skipped: number
  skippedRows?: {
    name: string
    errors: string[]
  }[]
}

type ImportSummary = {
  total: number
  valid: number
  invalid: number
}

type PreviewResponse = {
  rows: PreviewRow[]
  summary: ImportSummary
  importType?: ImportType
  error?: string
}

export default function BulkImportForm() {

  const [importType, setImportType] =
    useState<ImportType>("regular")

  const [excelFile, setExcelFile] =
    useState<File | null>(null)

  const [zipFile, setZipFile] =
    useState<File | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [preview, setPreview] =
    useState<PreviewRow[]>([])

  const [summary, setSummary] =
  useState<ImportSummary | null>(null)

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
  useState<ImportResult | null>(null)



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

            importType,

          }),

        }
      )

    const data: PreviewResponse =
      await response.json()

    if (!response.ok) {

  console.error(data.error)

  return

}

    setPreview(data.rows)
    setSummary(data.summary)

    if (data.importType) {
      setImportType(data.importType)
    }

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

  importType,

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

const previewColumns =
  preview.length > 0
    ? Object.keys(preview[0])
    : []

  return (

    <div className="space-y-8">

      <div className="grid gap-4 md:grid-cols-2">

        <button
          type="button"
          onClick={() => {
            setImportType("regular")
            setPreview([])
            setSummary(null)
          }}
          className={`
            rounded-3xl
            border
            p-6
            text-left
            transition-all
            ${
              importType === "regular"
                ? "border-pink-500 bg-pink-500/10 shadow-[0_0_35px_rgba(236,72,153,.25)]"
                : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
            }
          `}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-pink-400">
            Regular Stock
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Ready Inventory Import
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Use Name, Description, Price, Stock, Brand, Category, Badge and Image.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setImportType("preorder")
            setPreview([])
            setSummary(null)
          }}
          className={`
            rounded-3xl
            border
            p-6
            text-left
            transition-all
            ${
              importType === "preorder"
                ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_35px_rgba(34,211,238,.2)]"
                : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
            }
          `}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Pre-Orders
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Pre-Order Bulk Import
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Add Deposit, Expected Arrival, and optional PreOrderDeadline columns.
          </p>
        </button>

      </div>

      {/* Excel Upload */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <h2 className="text-2xl font-bold mb-4">
          Upload Excel File
        </h2>

        <label
  className="
  group
  flex
  cursor-pointer
  flex-col
  items-center
  justify-center
  rounded-2xl
  border-2
  border-dashed
  border-zinc-700
  bg-zinc-950
  p-10
  transition-all
  duration-300
  hover:border-pink-500
  hover:bg-zinc-900
  hover:shadow-[0_0_35px_rgba(236,72,153,.25)]
  hover:-translate-y-1
  "
>

  <input
    type="file"
    accept=".xlsx,.xls"
    className="hidden"
    onChange={(e) =>
      setExcelFile(
        e.target.files?.[0] || null
      )
    }
  />

  <div
    className="
    mb-4
    text-5xl
    transition-transform
    duration-300
    group-hover:scale-110
    group-hover:-translate-y-1
    "
  >
    📄
  </div>

  <p className="text-lg font-semibold">

    Choose Excel File

  </p>

  <p className="mt-2 text-sm text-zinc-400">

    Click to browse or drag & drop

  </p>

  {excelFile && (

    <div
      className="
      mt-5
      rounded-full
      bg-green-500/15
      px-5
      py-2
      text-green-400
      "
    >

      ✓ {excelFile.name}

    </div>

  )}

</label>

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

        <label
  className="
  group
  flex
  cursor-pointer
  flex-col
  items-center
  justify-center
  rounded-2xl
  border-2
  border-dashed
  border-zinc-700
  bg-zinc-950
  p-10
  transition-all
  duration-300
  hover:border-pink-500
  hover:bg-zinc-900
  hover:shadow-[0_0_35px_rgba(236,72,153,.25)]
  hover:-translate-y-1
  "
>

 <input
  type="file"
  accept=".zip"
  className="hidden"
  onChange={(e) =>
    setZipFile(
      e.target.files?.[0] || null
    )
  }
/>

  <div
    className="
    mb-4
    text-5xl
    transition-transform
    duration-300
    group-hover:scale-110
    group-hover:-translate-y-1
    "
  >
    🖼️
  </div>

  <p className="text-lg font-semibold">

    Choose Excel File

  </p>

  <p className="mt-2 text-sm text-zinc-400">

    Click to browse or drag & drop

  </p>

  {zipFile && (

  <div
    className="
      mt-5
      rounded-full
      bg-green-500/15
      px-5
      py-2
      text-green-400
    "
  >

    ✓ {zipFile.name}

  </div>

)}

</label>

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

  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="grid gap-6 md:grid-cols-3 mb-8"
  >

    {/* Total */}

    <motion.div
      whileHover={{
        scale: 1.04,
        y: -5,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
      className="
      rounded-3xl
      border
      border-zinc-800
      bg-zinc-900
      p-7
      shadow-xl
      hover:border-pink-500/50
      hover:shadow-[0_0_35px_rgba(236,72,153,.2)]
      "
    >

      <p className="text-zinc-400 text-sm uppercase tracking-wider">

        Total Products

      </p>

      <h2 className="mt-3 text-5xl font-black">

        {summary.total}

      </h2>

    </motion.div>

    {/* Valid */}

    <motion.div
      whileHover={{
        scale: 1.04,
        y: -5,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
      className="
      rounded-3xl
      border
      border-green-500/20
      bg-green-950
      p-7
      shadow-xl
      hover:border-green-400
      hover:shadow-[0_0_35px_rgba(34,197,94,.25)]
      "
    >

      <p className="text-green-300 text-sm uppercase tracking-wider">

        Ready to Import

      </p>

      <h2 className="mt-3 text-5xl font-black text-green-400">

        {summary.valid}

      </h2>

    </motion.div>

    {/* Invalid */}

    <motion.div
      whileHover={{
        scale: 1.04,
        y: -5,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
      className="
      rounded-3xl
      border
      border-red-500/20
      bg-red-950
      p-7
      shadow-xl
      hover:border-red-400
      hover:shadow-[0_0_35px_rgba(239,68,68,.25)]
      "
    >

      <p className="text-red-300 text-sm uppercase tracking-wider">

        Validation Errors

      </p>

      <h2 className="mt-3 text-5xl font-black text-red-400">

        {summary.invalid}

      </h2>

    </motion.div>

  </motion.div>

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

                {previewColumns.map((key) => (

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

    {previewColumns.map((key) => (

      <td
        key={key}
        className="px-5 py-4 align-top"
      >

        {key === "status" ? (

          row.status === "VALID" ? (

            <span className="px-3 py-1 rounded-full bg-green-600/20 text-green-400">
              VALID
            </span>

          ) : (

            <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400">
              INVALID
            </span>

          )

        ) : key === "errors" ? (

          (row.errors?.length ?? 0) === 0
            ? "-"
            : (
              <ul className="space-y-1">

                {row.errors?.map(
                  (error, i) => (

                    <li
                      key={i}
                      className="text-red-400"
                    >

                      • {error}

                    </li>

                  )
                )}

              </ul>
            )

        ) : row[key] !== undefined &&
          row[key] !== null &&
          String(row[key]).trim() !== "" ? (

          String(row[key])

        ) : (

          <span className="text-red-400">
            Not Filled
          </span>

        )}

      </td>

    ))}

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

   {(summary?.invalid ?? 0) > 0 && (

  <p className="text-yellow-400 text-sm">

    {summary?.invalid ?? 0} invalid product{summary?.invalid === 1 ? "" : "s"} will be skipped automatically.

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

{(importResult.skippedRows?.length ?? 0) > 0 && (

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

{(importResult.skippedRows ?? []).map(

(row, index) => (

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
