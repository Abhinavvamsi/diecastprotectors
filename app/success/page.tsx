"use client"

import Link from "next/link"

import { useSearchParams }
from "next/navigation"

import Navbar from "@/components/navbar"

import { Button }
from "@/components/ui/button"

export default function SuccessPage() {

  const searchParams =
    useSearchParams()

  const orderId =
    searchParams.get(
      "orderId"
    )

  return (

    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="flex items-center justify-center px-6 py-20">

        <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">

          <div className="text-7xl mb-6">

            🎉

          </div>

          <h1 className="text-5xl font-bold">

            Payment Successful

          </h1>

          <p className="text-zinc-400 text-lg mt-6 leading-relaxed">

            Thank you for shopping with HW Shield.

            Your order has been placed successfully.

          </p>

          {/* Order ID */}
<div className="mt-10 bg-black border border-zinc-800 rounded-2xl p-6">

  <p className="text-red-500 text-sm uppercase tracking-widest">
    Order ID
  </p>

  <p className="text-3xl font-bold mt-3 break-all">
    {orderId}
  </p>

</div>

{/* WhatsApp Community */}
<div
  className="
  mt-8
  p-6
  rounded-2xl
  border
  border-green-500/30
  bg-green-500/10
  text-center
  "
>

  <h3 className="text-xl font-bold text-green-400">
    🎉 Join The Diecast Protectors Community
  </h3>

  <p className="text-zinc-300 mt-3">

    Stay updated with:
    <br />
    ✅ Protector Restocks
    <br />
    ✅ New Product Launches
    <br />
    ✅ Exclusive Discounts
    <br />
    ✅ Diecast Collector Updates

  </p>

  <a
    href="https://chat.whatsapp.com/Gj5gV6SHqHM85CKDyDc3JJ?s=cl&p=i&ilr=0"
    target="_blank"
    rel="noopener noreferrer"
    className="
    inline-block
    mt-5
    px-6
    py-3
    rounded-xl
    bg-green-500
    text-white
    font-bold
    hover:bg-green-600
    "
  >
    🚀 Join WhatsApp Group
  </a>

</div>

{/* Buttons */}

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">

            <Link href="/track-order">

              <Button
                className="rounded-xl px-8 py-6 text-lg"
              >

                Track Order

              </Button>

            </Link>

            <Link href="/">

              <Button
                variant="outline"
                className="rounded-xl px-8 py-6 text-lg"
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