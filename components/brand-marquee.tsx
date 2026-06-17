"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type Brand = {
  id: string
  name: string
  logo?: string
}

export default function BrandMarquee() {

  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {

    async function fetchBrands() {

      try {

        const response =
  await fetch("/api/admin/brands")

        const data =
          await response.json()

        setBrands(data)

      } catch (error) {

        console.error(error)

      }

    }

    fetchBrands()

  }, [])

  return (

    <section className="overflow-hidden border-y border-gray-200 py-6 bg-white">

      <div className="flex marquee items-center">

        {[...brands, ...brands].map(
          (brand, index) => (

            <div
              key={`${brand.id}-${index}`}
              className="
              mx-12
              flex
              items-center
              justify-center
              shrink-0
              "
            >

              {brand.logo ? (

                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={140}
                  height={70}
                  className="
                  h-14
                  w-auto
                  object-contain
                  opacity-80
                  hover:opacity-100
                  transition
                  "
                />

              ) : (

                <span
                  className="
                  text-[#D4AF37]
                  font-bold
                  text-xl
                  "
                >
                  {brand.name}
                </span>

              )}

            </div>

          )
        )}

      </div>

    </section>

  )

}