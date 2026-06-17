"use client"

import Image from "next/image"

type Brand = {
  id: string
  name: string
  logo?: string
}

export default function BrandMarquee({
  brands,
}: {
  brands: Brand[]
}) {

  if (!brands.length) {
    return null
  }

  return (

    <section className="overflow-hidden w-full border-y border-gray-200 py-6 bg-white">

      <div className="marquee items-center">

        {[
          ...brands,
          ...brands,
          ...brands,
          ...brands,
        ].map((brand, index) => (

          <div
            key={`${brand.id}-${index}`}
            className="
            mx-10
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
                duration-300
                "
              />

            ) : (

              <span
                className="
                text-[#D4AF37]
                font-bold
                text-xl
                whitespace-nowrap
                "
              >
                {brand.name}
              </span>

            )}

          </div>

        ))}

      </div>

    </section>

  )

}