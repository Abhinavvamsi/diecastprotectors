"use client"

export default function BrandMarquee() {

  const brands = [

    "HOT WHEELS",
    "MINI GT",
    "INNO64",
    "POP RACE",
    "TARMAC WORKS",
    "MAJORETTE",
    "MATCHBOX",
    "KAIDO HOUSE",

  ]

  return (

    <section className="overflow-hidden border-y border-gray-200 py-5">

      <div className="flex marquee">

        {[...brands, ...brands].map(
          (brand, index) => (

            <div
              key={index}
              className="
              mx-12
              text-2xl
              font-bold
              whitespace-nowrap
              text-[#D4AF37]
              "
            >

              {brand}

            </div>

          )
        )}

      </div>

    </section>

  )

}