"use client"

import { useState } from "react"
import Image from "next/image"

export default function AdminProductsList({
  products,
  brands,
}: {
  products: any[]
  brands: any[]
}) {

  const [selectedBrand,
    setSelectedBrand] =
    useState("All")

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

          <option>
            All
          </option>

          {brands.map((brand) => (

            <option
              key={brand.id}
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

                <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs">

                  {product.category}

                </span>

                {product.brand && (

                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">

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

            </div>

          </div>

        ))}

      </div>

    </>

  )

}