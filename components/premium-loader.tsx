"use client"

import { Bebas_Neue } from "next/font/google"

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
})

export default function PremiumLoader() {

  return (

    <div
      className="
      min-h-screen
      flex
      flex-col
      items-center
      justify-center
      bg-white
      "
    >

      <h1
        className={`
          ${bebas.className}
          text-6xl
          md:text-8xl
          tracking-wide
          text-black
        `}
      >

        DIECAST

        <span className="text-[#D4AF37]">

          {" "}UNIVERSE

        </span>

      </h1>

      <p
        className="
        mt-4
        text-gray-500
        tracking-[0.3em]
        uppercase
        text-sm
        "
      >

        Loading Collection...

      </p>

      <div
        className="
        mt-8
        h-1
        w-56
        overflow-hidden
        rounded-full
        bg-gray-200
        "
      >

       <div
  className="
  h-full
  w-1/2
  bg-[#D4AF37]
  animate-[loader_1.5s_ease-in-out_infinite]
  "
/>

      </div>

    </div>

  )

}