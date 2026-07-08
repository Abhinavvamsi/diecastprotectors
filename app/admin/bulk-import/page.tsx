import { requireOwner } from "@/lib/admin"
import AdminNav from "@/components/admin-nav"
import BulkImportForm from "@/components/bulk-import-form"

export default async function BulkImportPage() {

  await requireOwner()

  return (

    <main className="min-h-screen bg-[#09090B] text-white p-8">

      <div className="max-w-7xl mx-auto">

        <AdminNav />

        {/* Header */}

        <div className="mb-12">

          <p
            className="
            uppercase
            tracking-[0.3em]
            text-sm
            bg-gradient-to-r
            from-pink-500
            via-fuchsia-500
            to-purple-500
            bg-clip-text
            text-transparent
            "
          >
            Shinsei Diecast Admin
          </p>

          <h1 className="text-5xl font-bold mt-4">
            Bulk Product Import
          </h1>

          <p className="text-zinc-400 mt-3 max-w-3xl">
            Import hundreds of products at once using an Excel spreadsheet and a ZIP
            file containing all product images. The importer will validate your data
            before creating products.
          </p>

        </div>

        {/* Import Form */}

        <div
          className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-3xl
          p-8
          shadow-2xl
          "
        >

          <BulkImportForm />

        </div>

      </div>

    </main>

  )

}