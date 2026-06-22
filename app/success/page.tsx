"use client"

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

    <main className="min-h-screen bg-white text-black">

      <Navbar />

      <div className="flex items-center justify-center px-6 py-20">

        <div
          className="
          w-full
          max-w-3xl
          bg-white
          border
          border-gray-200
          shadow-sm
          rounded-3xl
          p-12
          text-center
          "
        >

          {/* Success Icon */}

          <div className="text-7xl mb-6">

            🎉

          </div>

          {/* Heading */}

          <h1 className="text-5xl font-bold">

            Payment Successful

          </h1>

          <p className="text-gray-500 text-lg mt-6 leading-relaxed">

            Thank you for shopping with Diecast Universe.

            Your order has been placed successfully.

          </p>

          {/* Order ID */}

          <div
            className="
            mt-10
            bg-[#FAFAFA]
            border
            border-gray-200
            rounded-2xl
            p-8
            "
          >

            <p
              className="
              text-[#D4AF37]
              text-sm
              uppercase
              tracking-widest
              font-semibold
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
            border-[#D4AF37]/30
            bg-[#FFF8E6]
            text-center
            "
          >

            <h3
              className="
              text-2xl
              font-bold
              text-[#D4AF37]
              "
            >

              🎉 Join The Diecast Universe Community

            </h3>

            <div
              className="
              text-gray-700
              mt-5
              space-y-2
              "
            >

              <p>
                ✅ Protector Restocks
              </p>

              <p>
                ✅ New Product Launches
              </p>

              <p>
                ✅ Exclusive Discounts
              </p>

              <p>
                ✅ Diecast Collector Updates
              </p>

            </div>

            <a
              href="https://chat.whatsapp.com/Gj5gV6SHqHM85CKDyDc3JJ?s=cl&p=i&ilr=0"
              target="_blank"
              rel="noopener noreferrer"
              className="
              inline-block
              mt-6
              px-8
              py-4
              rounded-xl
              bg-[#D4AF37]
              text-black
              font-bold
              hover:bg-[#B8941F]
              transition
              "
            >

              🚀 Join WhatsApp Group

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
                bg-[#D4AF37]
                hover:bg-[#B8941F]
                text-black
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
                border-[#D4AF37]
                text-black
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