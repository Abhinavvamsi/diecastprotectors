import { requireOwner } from "@/lib/admin"
import AdminNav from "@/components/admin-nav"
import BulkImportForm from "@/components/bulk-import-form"
import { Upload, FileSpreadsheet, ImageIcon, ShieldCheck } from "lucide-react"

export default async function BulkImportPage() {

  await requireOwner()

  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      <div className="max-w-7xl mx-auto px-6 py-8">

        <AdminNav />

        {/* Hero */}

        <div className="relative overflow-hidden rounded-[36px] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-10 mb-10">

          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-pink-500/10 blur-[120px]" />
          <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-purple-600/10 blur-[120px]" />

          <p className="uppercase tracking-[0.35em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

            Shinsei Diecast Admin

          </p>

          <h1 className="mt-5 text-5xl md:text-6xl font-black">

            Bulk Product Import

          </h1>

          <p className="mt-5 max-w-3xl text-lg text-zinc-400 leading-8">

            Upload hundreds of products in minutes using a single Excel file and a ZIP
            containing all product images. Every row is validated before importing,
            ensuring clean and accurate product data.

          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <a
              href="https://docs.google.com/spreadsheets/d/15D20omuEFxXub8oi4VeBdJrGtymkoWVcLaxOVm1oE7M/edit?usp=sharing"
              className="
rounded-xl
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
px-6
py-3
font-semibold
text-white
transition-all
duration-300
hover:scale-105
hover:shadow-[0_0_35px_rgba(236,72,153,.45)]
active:scale-95
"
            >
              View Excel Template
            </a>

            <span className="rounded-xl border border-zinc-700 px-6 py-3 text-zinc-300">

              Supports XLSX + ZIP Images

            </span>

          </div>

        </div>

        {/* Features */}

        <div className="grid gap-6 md:grid-cols-4 mb-10">

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

            <FileSpreadsheet className="h-10 w-10 text-pink-500" />

            <h3 className="mt-5 text-xl font-bold">

              Excel Import

            </h3>

            <p className="mt-2 text-zinc-400">

              Read hundreds of products instantly.

            </p>

          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

            <ShieldCheck className="h-10 w-10 text-green-500" />

            <h3 className="mt-5 text-xl font-bold">

              Validation

            </h3>

            <p className="mt-2 text-zinc-400">

              Detect missing data before importing.

            </p>

          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

            <ImageIcon className="h-10 w-10 text-yellow-500" />

            <h3 className="mt-5 text-xl font-bold">

              Image Upload

            </h3>

            <p className="mt-2 text-zinc-400">

              Upload all product images automatically.

            </p>

          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">

            <Upload className="h-10 w-10 text-blue-500" />

            <h3 className="mt-5 text-xl font-bold">

              Smart Import

            </h3>

            <p className="mt-2 text-zinc-400">

              Existing products are updated automatically.

            </p>

          </div>

        </div>

        {/* Tips */}

        <div className="mb-10 rounded-3xl border border-yellow-500/30 bg-yellow-500/5 p-8">

          <h2 className="text-2xl font-bold">

            Before You Import

          </h2>

          <ul className="mt-5 space-y-3 text-zinc-300">

            <li>✅ Brand names must already exist in the database.</li>

            <li>✅ Image names must exactly match the Excel Image column.</li>

            <li>✅ Upload all images inside a single ZIP file.</li>

            <li>✅ Invalid products are skipped automatically.</li>


          </ul>

        </div>

        {/* Import Form */}

        <div className="rounded-[32px] border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">

          <BulkImportForm />

        </div>

      </div>

    </main>

  )

}