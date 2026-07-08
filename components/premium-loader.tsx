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
      bg-[#09090B]
      "
    >

      <h1
        className={`
          ${bebas.className}
          text-6xl
          md:text-8xl
          tracking-wide
          text-white
        `}
      >

        SHINSEI

        <span
          className="
          bg-gradient-to-r
          from-pink-500
          via-fuchsia-500
          to-purple-500
          bg-clip-text
          text-transparent
          "
        >

          {" "}DIECAST

        </span>

      </h1>

      <p
        className="
        mt-4
        text-zinc-400
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
        bg-zinc-800
        "
      >

        <div
          className="
          h-full
          w-1/2
          bg-gradient-to-r
          from-pink-500
          via-fuchsia-500
          to-purple-600
          animate-[loader_1.5s_ease-in-out_infinite]
          "
        />

      </div>

    </div>

  )

}