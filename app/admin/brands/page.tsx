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

    <main className="min-h-screen bg-white text-black p-8">

      <div className="max-w-7xl mx-auto">

        <AdminNav />

        <h1 className="text-5xl font-bold mb-10">

          Brand Management

        </h1>

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6 mb-10">

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
              border
              border-gray-300
              px-4
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
  border-gray-300
  cursor-pointer
  hover:border-[#D4AF37]
  transition
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
              bg-[#D4AF37]
              text-black
              font-semibold
              "
            >

              Create

            </button>

          </div>
{logo && (

  <div className="mt-6">

    <p className="text-sm text-gray-500 mb-2">

      Logo Preview

    </p>

    <img
      src={logo}
      alt="Brand Logo"
      className="
      w-24
      h-24
      object-contain
      border
      border-gray-200
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
              bg-white
              border
              border-gray-200
              shadow-sm
              rounded-3xl
              p-6
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
  border-red-500
  text-red-500
  hover:bg-red-500
  hover:text-white
  transition
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