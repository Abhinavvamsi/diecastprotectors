"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function BrandsSection() {

  const [brands, setBrands] =
    useState<any[]>([])

  useEffect(() => {

    async function loadBrands() {

      const response =
  await fetch(
    "/api/admin/brands"
  )
      const data =
        await response.json()

      setBrands(data)

    }

    loadBrands()

  }, [])

  if (brands.length === 0) {

    return null

  }

  return (

    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24">

      <div className="mb-10">

        <p className="text-[#D4AF37] uppercase tracking-widest text-sm">

          Explore By Brand

        </p>

        <h2 className="text-4xl font-bold mt-2">

          Shop Your Favorite Brands

        </h2>

      </div>

      <div
        className="
        grid
        grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        gap-6
        "
      >

        {brands.map((brand) => (

         <Link
  key={brand.id}
  href={`/brands/${brand.id}`}
  prefetch
>

            <div
  className="
  h-full
  flex
  flex-col
  bg-white
  border
  border-gray-200
  rounded-3xl
  overflow-hidden
  shadow-sm
  hover:shadow-lg
  hover:border-[#D4AF37]
  hover:-translate-y-1
  transition-all
  duration-300
  "
>

              <div
  className="
  h-56
  flex
  items-center
  justify-center
  bg-gray-50
  p-8
  "
>

  {brand.logo && (

    <Image
      src={brand.logo}
      alt={brand.name}
      width={180}
      height={100}
      className="
      max-h-24
      w-auto
      h-auto
      object-contain
      "
    />

  )}

</div>

              <div className="p-5 flex-1">

                <h3 className="font-bold text-lg">

                  {brand.name}

                </h3>

                <p className="text-gray-500 text-sm mt-1">

                  {brand._count.products}
                  {" "}
                  Products

                </p>

              </div>

            </div>

          </Link>

        ))}

      </div>

    </section>

  )

}