"use client"

export default function PremiumLoader() {

  return (

    <div
      className="
      min-h-[500px]
      flex
      flex-col
      items-center
      justify-center
      "
    >

      <h1
        className="
        text-5xl
        md:text-7xl
        font-bold
        tracking-widest
        text-[#D4AF37]
        animate-pulse
        "
      >

        DIECAST UNIVERSE

      </h1>

      <div
        className="
        mt-8
        w-64
        h-1
        bg-gray-200
        rounded-full
        overflow-hidden
        "
      >

        <div
          className="
          h-full
          w-1/2
          bg-[#D4AF37]
          animate-[loading_1.5s_linear_infinite]
          "
        />

      </div>

      <p
        className="
        mt-6
        text-gray-500
        uppercase
        tracking-[0.3em]
        text-sm
        "
      >

        Loading Collectibles...

      </p>

    </div>

  )

}