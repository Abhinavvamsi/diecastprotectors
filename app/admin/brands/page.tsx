"use client"

import AdminNav from "@/components/admin-nav"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function BrandsPage() {

  const [brands, setBrands] =
    useState<any[]>([])

  const [name, setName] =
    useState("")

    const [logo, setLogo] = useState("")

    const [uploading, setUploading] = useState(false)

  async function loadBrands() {

    const response =
      await fetch(
        "/api/admin/brands"
      )

    const data =
      await response.json()

    setBrands(data)

  }

  async function createBrand() {

    if (!name) return

    const response =
      await fetch(
        "/api/admin/brands",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
       body: JSON.stringify({
  name,
  logo,
}),
        }
      )

    if (response.ok) {

      toast.success(
        "Brand Created"
      )

      setName("")
    setLogo("")

      loadBrands()

    }

  }

  async function deleteBrand(
  id: string
) {

  const response =
    await fetch(
      `/api/admin/brands/${id}`,
      {
        method: "DELETE",
      }
    )

  const data =
    await response.json()

  if (response.ok) {

    toast.success(
      "Brand deleted successfully"
    )

    loadBrands()

  } else {

    toast.error(
      data.error
    )

  }

}
async function handleLogoUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {

  const file =
    e.target.files?.[0]

  if (!file) return

  try {

    setUploading(true)

    const formData =
      new FormData()

    formData.append(
      "file",
      file
    )

    const response =
      await fetch(
        "/api/upload-image",
        {
          method: "POST",
          body: formData,
        }
      )

    const data =
      await response.json()

    setLogo(
      data.imageUrl
    )

    toast.success(
      "Logo uploaded 🚀"
    )

  } finally {

    setUploading(false)

  }

}
  useEffect(() => {

    loadBrands()

  }, [])

  return (

    <main className="min-h-screen bg-[#09090B] text-white p-8">

      <div className="max-w-7xl mx-auto">

        <AdminNav />

        <h1 className="text-5xl font-bold mb-10 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

          Brand Management

        </h1>

        <div className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-6 mb-10">

          <h2 className="text-xl font-bold mb-4">

            Create Brand

          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="Hot Wheels"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="
flex-1
h-14
rounded-xl
bg-zinc-950
border
border-zinc-700
px-4
text-white
placeholder:text-zinc-500
outline-none
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
"
            />
<label
  className="
flex
items-center
justify-center
h-14
rounded-xl
border-2
border-dashed
border-zinc-700
bg-zinc-950
cursor-pointer
hover:border-pink-500
hover:bg-pink-500/5
transition-all
duration-300
"
>

  {uploading
    ? "Uploading..."
    : "Upload Brand Logo"}

  <input
    type="file"
    accept="image/*"
    onChange={handleLogoUpload}
    className="hidden"
  />

</label>
            <button
              onClick={createBrand}
              className="
px-6
rounded-xl
font-semibold
text-white
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
transition-all
duration-300
"
            >

              Create

            </button>

          </div>
{logo && (

  <div className="mt-6">

    <p className="text-sm text-zinc-400 mb-2">

      Logo Preview

    </p>

    <img
      src={logo}
      alt="Brand Logo"
      className="
w-24
h-24
object-contain
bg-zinc-950
border
border-zinc-700
rounded-xl
p-2
"
    />

  </div>

)}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {brands.map((brand) => (

            <div
              key={brand.id}
              className="
bg-zinc-900
border
border-zinc-800
shadow-2xl
rounded-3xl
p-6
transition-all
duration-300
hover:border-pink-500/40
hover:-translate-y-1
hover:shadow-[0_0_25px_rgba(236,72,153,.18)]
"
            >

              <h2 className="text-2xl font-bold">

                {brand.name}

              </h2>
{brand.logo && (

  <img
    src={brand.logo}
    alt={brand.name}
    className="
w-16
h-16
object-contain
mt-4
bg-zinc-950
border
border-zinc-700
rounded-xl
p-2
"
  />

)}
<button
  onClick={() =>
    deleteBrand(
      brand.id
    )
  }
  className="
mt-4
w-full
h-12
rounded-xl
border
border-pink-500
text-pink-400
hover:bg-pink-500
hover:text-white
transition-all
duration-300
"
>

  Delete Brand

</button>
            </div>
            

          ))}

        </div>

      </div>

    </main>

  )

}