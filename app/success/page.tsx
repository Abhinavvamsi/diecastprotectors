"use client"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"

export default function SuccessPage() {

  const searchParams =
    useSearchParams()

  const orderId =
    searchParams.get(
      "orderId"
    )

  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      <Navbar />

      <div className="flex items-center justify-center px-6 py-20">

        <div
          className="
          w-full
          max-w-3xl
          border
          bg-zinc-900
border-zinc-800
          shadow-xl
          rounded-3xl
          p-12
          text-center
          "
        >

          {/* Success Icon */}


<div className="flex justify-center mb-8">
  <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
    <CheckCircle2
      size={64}
      className="text-green-500"
    />
  </div>
</div>

          {/* Heading */}

          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
    Payment Successful
</h1>

          <p className="text-zinc-400 text-lg mt-6 leading-relaxed">

            Thank you for shopping with Shinsei Diecast.

Your order has been confirmed and we're preparing it for dispatch.

          </p>

          {/* Order ID */}

          <div
            className="
            mt-10
            bg-zinc-950
            border
            border-zinc-800
            rounded-2xl
            p-8
            "
          >

           <p
  className="
  text-sm
  uppercase
  tracking-widest
  font-semibold
  bg-gradient-to-r
  from-pink-500
  via-fuchsia-500
  to-purple-500
  bg-clip-text
  text-transparent
  "
>
  Order ID
</p>

            <p
              className="
              text-3xl
              font-bold
              mt-3
              break-all
              "
            >

              {orderId}

            </p>

          </div>

          {/* WhatsApp Community */}

          <div
            className="
            mt-8
            p-8
            rounded-3xl
            border
            bg-gradient-to-br
from-pink-500/10
to-purple-600/10

border-purple-500/30
            text-center
            "
          >

            <h3
              className="
              text-2xl
              font-bold
              bg-gradient-to-r
from-pink-500
to-purple-500
bg-clip-text
text-transparent
              "
            >

              Join the Shinsei Diecast Community

            </h3>

            <div
              className="
              text-zinc-300
              mt-5
              space-y-2
              "
            >

              <p>
                ✅ Latest arrivals
              </p>

              <p>
                ✅ New product launches
              </p>

              <p>
                ✅ Exclusive offers
              </p>

              <p>
                ✅ Collector updates
              </p>

            </div>

            <a
              href="https://chat.whatsapp.com/LXeocqm0ctA0ohmQSNfP0t?s=cl&p=a&ilr=1&amv=2"
              target="_blank"
              rel="noopener noreferrer"
              className="
              inline-block
              mt-6
              px-8
              py-4
              rounded-xl
              bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600

hover:shadow-[0_0_30px_rgba(236,72,153,.4)]
              text-black
              font-bold
              hover:scale-105
transition-all
duration-300
              transition
              "
            >

              Join WhatsApp Community

            </a>

          </div>

          {/* Action Buttons */}

          <div
            className="
            grid
            md:grid-cols-2
            gap-4
            mt-10
            "
          >

            <Link
              href={`/track-order?orderId=${orderId}`}
            >

              <Button
                className="
                w-full
                h-14
                rounded-xl
                bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white

hover:shadow-[0_0_30px_rgba(236,72,153,.4)]
                font-semibold
                "
              >

                Track Order

              </Button>

            </Link>

            <Link href="/">

              <Button
                variant="outline"
                className="
                w-full
                h-14
                rounded-xl
                border-pink-500
text-pink-400

hover:bg-pink-500
hover:text-white
                hover:bg-[#D4AF37]/10
                "
              >

                Continue Shopping

              </Button>

            </Link>

          </div>

        </div>

      </div>

    </main>

  )

}
