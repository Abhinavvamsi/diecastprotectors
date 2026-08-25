"use client"

import Link from "next/link"
import Image from "next/image"
import { getBrandLogoUrl } from "@/lib/cloudinary-url"

export default function BrandsSection({
  brands,
}: {
  brands: any[]
}) {
  if (!brands.length) {

    return null

  }

  return (

    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24">

      <div className="mb-10">

        <p className="uppercase tracking-widest text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

          Explore By Brand

        </p>

        <h2 className="text-4xl font-bold mt-2 text-white">

          Shop Your Favorite Brands

        </h2>

      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">

        {brands.map((brand) => (

          <Link
            key={brand.id}
            href={`/brands/${brand.id}`}
            prefetch={true}
          >

            <div
              className="
              flex
              flex-col
              aspect-square
              bg-zinc-900
              border
              border-zinc-800
              rounded-3xl
              overflow-hidden
              shadow-sm
              hover:shadow-[0_0_30px_rgba(236,72,153,.2)]
              hover:border-pink-500/50
              hover:-translate-y-1
              transition-all
              duration-300
              "
            >

              <div
                className="
                flex-1
                flex
                items-center
                justify-center
                bg-zinc-950
                p-5 md:p-6
                "
              >

                {brand.logo && (

                  <Image
                    src={getBrandLogoUrl(brand.logo)}
                    alt={brand.name}
                    width={120}
                    height={120}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="
                    max-h-16
                    max-w-[90px]
                    md:max-h-20
                    md:max-w-[110px]
                    w-auto
                    h-auto
                    object-contain
                    "
                  />

                )}

              </div>

              <div className="p-4 text-center md:p-5">

                <h3 className="font-bold text-sm text-white md:text-base">

                  {brand.name}

                </h3>

                <p className="mt-1 text-xs text-zinc-400 md:text-sm">

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
