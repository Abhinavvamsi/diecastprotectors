"use client"

import { useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { toast } from "sonner"

export default function AdminProductsList({
  products,
  brands,
}: {
  products: any[]
  brands: any[]
}) {

  const [selectedBrand, setSelectedBrand] =
    useState("All")
  const [search, setSearch] =
    useState("")
const [deletingId, setDeletingId] =
  useState("")

  const normalizedSearch =
    search.trim().toLowerCase()

  const filteredProducts =
    products.filter((product) => {
      const matchesBrand =
        selectedBrand === "All" ||
        product.brand?.name === selectedBrand

      const matchesSearch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.brand?.name
          ?.toLowerCase()
          .includes(normalizedSearch)

      return matchesBrand && matchesSearch
    })

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row">

        <div className="relative flex-1">

          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products, categories, or brands..."
            className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900 pl-12 pr-4 text-white outline-none transition-all placeholder:text-zinc-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30"
          />

        </div>

        <select
          value={selectedBrand}
          onChange={(e) =>
            setSelectedBrand(
              e.target.value
            )
          }
          className="
h-12
px-4
rounded-xl
border
border-zinc-700
bg-zinc-900
text-white
outline-none
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
"
        >

          <option value="All">
            All
          </option>

          {brands.map((brand) => (

            <option
              key={brand.id}
              value={brand.name}
            >
              {brand.name}
            </option>

          ))}

        </select>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {filteredProducts.map((product) => (

          <div
            key={product.id}
            className="
bg-zinc-900
border
border-zinc-800
shadow-2xl
rounded-3xl
overflow-hidden
transition-all
duration-300
hover:border-pink-500/40
hover:-translate-y-1
hover:shadow-[0_0_30px_rgba(236,72,153,.18)]
"
          >

            <div className="relative h-72 bg-zinc-950">

              <Image
                src={
                  Array.isArray(product.images)
                    ? String(product.images[0])
                    : "/placeholder.png"
                }
                alt={product.name}
                fill
                className="object-contain"
              />

            </div>

            <div className="p-6">

              <div className="flex gap-2 mb-3">

                <span
                  className="
px-3
py-1
rounded-full
bg-pink-500/15
text-pink-400
text-xs
border
border-pink-500/30
"
                >
                  {product.category}
                </span>

                {product.brand && (

                  <span
                   className="
px-3
py-1
rounded-full
bg-purple-500/15
text-purple-400
text-xs
border
border-purple-500/30
"
                  >
                    {product.brand.name}
                  </span>

                )}

              </div>

              <h2 className="text-2xl font-bold">

                {product.name}

              </h2>

              <p className="text-zinc-400 mt-3">

                Stock: {product.stock}

              </p>

              <div className="flex gap-3 mt-6">

                <a
  href={`/admin/products/${product.id}/edit`}
  className="
flex-1
h-11
rounded-xl
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
font-semibold
flex
items-center
justify-center
transition-all
duration-300
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
"
>
  Edit
</a>

               <button
  disabled={
    deletingId === product.id
  }
  onClick={async () => {

    try {

      setDeletingId(
        product.id
      )

      const response =
        await fetch(
          `/api/delete-product?id=${product.id}`,
          {
            method: "POST",
          }
        )

      if (!response.ok) {

        toast.error(
          "Failed to delete product"
        )

        setDeletingId("")

        return

      }

      toast.success(
        "Product deleted successfully"
      )

      setTimeout(() => {

        window.location.reload()

      }, 800)

    } catch {

      toast.error(
        "Something went wrong"
      )

      setDeletingId("")

    }

  }}
 className="
flex-1
h-11
rounded-xl
border
border-pink-500
text-pink-400
font-semibold
hover:bg-pink-500
hover:text-white
transition-all
duration-300
disabled:opacity-60
"
>

  {deletingId === product.id
    ? "Deleting..."
    : "Delete"}

</button>
              </div>

            </div>

          </div>

        ))}

      </div>

      {filteredProducts.length === 0 && (

        <p className="py-12 text-center text-zinc-400">
          No products match your search.
        </p>

      )}

    </>
  )

}
