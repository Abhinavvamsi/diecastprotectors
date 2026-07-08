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

    <section className="overflow-hidden w-full border-y border-zinc-800 py-6 bg-[#09090B]">

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
            mx-8
            flex
            items-center
            justify-center
            shrink-0
            "
          >

            {brand.logo ? (

              <div
                className="
                h-20
                w-40
                rounded-2xl
                bg-zinc-900
                border
                border-zinc-800
                flex
                items-center
                justify-center
                transition-all
                duration-300
                hover:border-pink-500/50
                hover:shadow-[0_0_25px_rgba(236,72,153,.25)]
                "
              >

                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="
                  h-12
                  w-auto
                  object-contain
                  opacity-90
                  hover:opacity-100
                  transition
                  duration-300
                  "
                />

              </div>

            ) : (

              <span
                className="
                text-xl
                font-bold
                whitespace-nowrap
                bg-gradient-to-r
                from-pink-500
                via-fuchsia-500
                to-purple-500
                bg-clip-text
                text-transparent
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