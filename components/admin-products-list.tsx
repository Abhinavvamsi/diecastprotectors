"use client"

import { useState } from "react"
import Image from "next/image"
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
const [deletingId, setDeletingId] =
  useState("")
  const filteredProducts =
    selectedBrand === "All"
      ? products
      : products.filter(
          (product) =>
            product.brand?.name ===
            selectedBrand
        )

  return (
    <>
      <div className="mb-10">

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
          border-gray-300
          bg-white
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
            bg-white
            border
            border-gray-200
            shadow-sm
            rounded-3xl
            overflow-hidden
            "
          >

            <div className="relative h-72">

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
                  bg-[#D4AF37]/10
                  text-[#D4AF37]
                  text-xs
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
                    bg-blue-100
                    text-blue-600
                    text-xs
                    "
                  >
                    {product.brand.name}
                  </span>

                )}

              </div>

              <h2 className="text-2xl font-bold">

                {product.name}

              </h2>

              <p className="text-gray-500 mt-3">

                Stock: {product.stock}

              </p>

              <div className="flex gap-3 mt-6">

                <a
  href={`/admin/products/${product.id}/edit`}
  className="
  flex-1
  h-11
  rounded-xl
  bg-[#D4AF37]
  text-black
  font-semibold
  flex
  items-center
  justify-center
  hover:bg-[#B8941F]
  transition
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
  border-red-500
  text-red-500
  font-semibold
  hover:bg-red-500
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

    </>
  )

}