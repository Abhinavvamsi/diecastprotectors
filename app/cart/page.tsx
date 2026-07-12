"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect } from "react"

import Navbar from "@/components/navbar"

import { Button } from "@/components/ui/button"

import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react"

import { useCartStore } from "@/store/cart-store"

export default function CartPage() {

  const cart = useCartStore(
    (state) => state.cart
  )

  const syncStock =
    useCartStore(
      (state) => state.syncStock
    )

  const increaseQuantity =
    useCartStore(
      (state) => state.increaseQuantity
    )

  const decreaseQuantity =
    useCartStore(
      (state) => state.decreaseQuantity
    )

  const removeFromCart =
    useCartStore(
      (state) => state.removeFromCart
    )
    

    function getCurrentPrice(item: any) {

  let price =
    item.originalPrice

  if (
    item.quantityPricing
  ) {

    item.quantityPricing.forEach(
  (tier: any) => {

    if (
      !tier.quantity ||
      !tier.price
    ) {
      return
    }

    if (
      item.quantity >=
      Number(tier.quantity)
    ) {

      price =
        Number(tier.price)

    }

  }
)

  }

  return price

}

  useEffect(() => {

    async function cleanupExpiredReservations() {
      try {
        await fetch(
          "/api/reservations/cleanup-user",
          {
            method: "POST",
          }
        )
      } catch {
        // Ignore cleanup failures and keep cart usable.
      }
    }

    async function refreshStock() {

      const response = await fetch(
        "/api/get-products",
        {
          cache: "no-store",
        }
      )

      const products =
        await response.json()
      const validIds =
  products.map(
    (product: any) =>
      product.id
  )

cart.forEach((item) => {

  if (
    !validIds.includes(
      item.id
    )
  ) {

    removeFromCart(
      item.id
    )

  }

})
      products.forEach(
        (product: any) => {

          syncStock(
            product.id,
            product.stock
          )

        }
      )

    }

    void cleanupExpiredReservations()
    refreshStock()

  }, [syncStock])

  const totalPrice = cart.reduce(
  (total, item) =>
    total +
    getCurrentPrice(item) *
      item.quantity,
  0
)
const hasUnavailableProducts =
  cart.some(
    (item) => item.stock === 0
  )

  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      {/* Global Navbar */}
      <Navbar />
<div
  className="
  absolute
  top-0
  right-0
  w-[450px]
  h-[450px]
  bg-purple-500/10
  blur-[140px]
  rounded-full
  pointer-events-none
  "
/>

<div
  className="
  absolute
  bottom-0
  left-0
  w-[450px]
  h-[450px]
  bg-pink-500/10
  blur-[140px]
  rounded-full
  pointer-events-none
  "
/>
      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">

          <div>
<p className="bg-gradient-to-r
from-pink-500
to-purple-500
bg-clip-text
text-transparent uppercase tracking-widest text-sm mb-3">
  Shinsei Diecast
</p>
            <h1 className="text-5xl font-bold">
              Your Cart
            </h1>

            <p className="text-gray-400 mt-4">

              Review your selected products before checkout.

            </p>

          </div>

          <Link href="/cars">

            <Button
  className="
  mt-8
  rounded-xl
  px-8
  py-6
  text-lg
 bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.4)]
  "
>

              Continue Shopping

            </Button>

          </Link>

        </div>
{hasUnavailableProducts && (

  <div
    className="
    mb-8
    p-4
    rounded-xl
    border
    border-orange-500/30
bg-orange-500/10
text-orange-300
    "
  >

    Some products in your cart are no longer available.
    Please remove them before checkout.

  </div>

)}
        {cart.length === 0 ? (

          <div className="text-center py-24">

            <p className="text-gray-400 text-xl">
              Your cart is empty.
            </p>

            <Link href="/cars">

              <Button className="
mt-8
rounded-xl
px-8
py-6
bg-gradient-to-r
from-pink-500
to-purple-600
text-white
hover:scale-105
transition
">

                Shop Products

              </Button>

            </Link>

          </div>

        ) : (

          <div className="space-y-6">

            {cart.map((item) => (

              <div
                key={item.id}
                className="
flex
flex-col
md:flex-row
md:items-center
md:justify-between
bg-[#15151D]
border
border-[#2B2B3A]
rounded-3xl
p-6
shadow-sm
hover:border-pink-500
hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
transition-all
duration-300
"
              >

                {/* LEFT */}
                <div className="flex items-center gap-6">

                  <div
  className="
  relative
  w-32
  h-32
  rounded-2xl
  overflow-hidden
 bg-[#09090B]
  border
  border-[#2B2B3A]
  flex-shrink-0
  "
>

                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-white">
                      {item.name}
                    </h2>

                    <p className="bg-gradient-to-r
from-pink-500
to-purple-500
bg-clip-text
text-transparent
font-bold mt-2">
                      ₹{getCurrentPrice(item)}
                    </p>

                    {item.stock > 0 ? (

  <p className="text-green-500 mt-2 font-medium">

    Stock Left:
    {" "}
    {item.stock}

  </p>

) : (

  <div
    className="
    mt-2
    inline-flex
    items-center
    px-3
    py-1
    rounded-full
    bg-red-500/20
    text-red-400
    text-sm
    font-semibold
    "
  >

    ❌ Product No Longer Available

  </div>

)}

                    <p className="text-gray-400 mt-2">

                      Total:
                      {" "}
                      ₹
{getCurrentPrice(item) *
  item.quantity}

                    </p>

                  </div>

                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4">

                  {/* Quantity Controls */}
                  <div
  className="
  flex
  items-center
  border
  border-[#2B2B3A]
bg-[#09090B]
  rounded-2xl
  overflow-hidden
  "
>

  <button
    onClick={() =>
      decreaseQuantity(item.id)
    }
    className="
    w-14
    h-14
    flex
    items-center
    justify-center
    hover:bg-[#1E1E2A]
hover:text-pink-400
    transition
    "
  >
    <Minus size={18} />
  </button>

  <div
    className="
    w-16
    text-center
    font-bold
text-lg
text-white
    "
  >
    {item.quantity}
  </div>

  <button
    disabled={
      item.quantity >= item.stock
    }
    onClick={() =>
      increaseQuantity(item.id)
    }
    className="
    w-14
    h-14
    flex
    items-center
    justify-center
    hover:bg-[#1E1E2A]
hover:text-pink-400
    transition
    disabled:opacity-40
    "
  >
    <Plus size={18} />
  </button>

</div>

                  {/* Remove */}
                  <button
  onClick={() =>
    removeFromCart(item.id)
  }
  className="
  w-14
  h-14
  rounded-2xl
  bg-red-500/10
  text-red-500
  flex
  items-center
  justify-center
  hover:bg-red-500
  hover:text-white
  transition-all
  duration-300
  "
>
  <Trash2 size={18} />
</button>

                </div>

              </div>

            ))}

            {/* Footer */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-10 border-t border-[#2B2B3A]">

              <div>

                <p className="text-pink-400">
                  Total
                </p>

                <h2 className="text-4xl font-bold mt-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

                  ₹{totalPrice}

                </h2>

              </div>

              <Link
  href={
    hasUnavailableProducts
      ? "#"
      : "/checkout"
  }
>

  <Button
  disabled={hasUnavailableProducts}
  className="
  px-8
  py-6
  text-lg
  rounded-xl
 bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.4)]
  "
>

    {hasUnavailableProducts
      ? "Remove Unavailable Items"
      : "Proceed to Checkout"}

  </Button>

</Link>
            </div>

          </div>

        )}

      </div>

    </main>

  )

}
