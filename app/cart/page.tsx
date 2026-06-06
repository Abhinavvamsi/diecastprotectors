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

    <main className="min-h-screen bg-black text-white">

      {/* Global Navbar */}
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">

          <div>

            <h1 className="text-5xl font-bold">
              Your Cart
            </h1>

            <p className="text-red-500 mt-4">

              Review your selected products before checkout.

            </p>

          </div>

          <Link href="/#products">

            <Button
              variant="outline"
              className="rounded-xl"
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
    border-red-500/30
    bg-red-500/10
    text-red-400
    "
  >

    Some products in your cart are no longer available.
    Please remove them before checkout.

  </div>

)}
        {cart.length === 0 ? (

          <div className="text-center py-24">

            <p className="text-red-500 text-xl">
              Your cart is empty.
            </p>

            <Link href="/#products">

              <Button className="mt-8 rounded-xl px-8 py-6 text-lg">

                Shop Products

              </Button>

            </Link>

          </div>

        ) : (

          <div className="space-y-6">

            {cart.map((item) => (

              <div
                key={item.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between bg-zinc-900 border border-zinc-800 rounded-3xl p-6 gap-6"
              >

                {/* LEFT */}
                <div className="flex items-center gap-6">

                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden">

                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />

                  </div>

                  <div>

                    <h2 className="text-2xl font-semibold">
                      {item.name}
                    </h2>

                    <p className="text-red-500 mt-2">
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

                    <p className="text-zinc-400 mt-2">

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
                  <div className="flex items-center bg-black border border-zinc-800 rounded-xl overflow-hidden">

                    <button
                      onClick={() =>
                        decreaseQuantity(
                          item.id
                        )
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >

                      <Minus size={18} />

                    </button>

                    <div className="w-12 text-center font-bold">

                      {item.quantity}

                    </div>

                    <button
                      disabled={
                        item.quantity >=
                        item.stock
                      }
                      onClick={() =>
                        increaseQuantity(
                          item.id
                        )
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >

                      <Plus size={18} />

                    </button>

                  </div>

                  {/* Remove */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="w-12 h-12 rounded-xl"
                    onClick={() =>
                      removeFromCart(
                        item.id
                      )
                    }
                  >

                    <Trash2 size={18} />

                  </Button>

                </div>

              </div>

            ))}

            {/* Footer */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mt-10 border-t border-zinc-800 pt-10">

              <div>

                <p className="text-red-500">
                  Total
                </p>

                <h2 className="text-4xl font-bold mt-2">

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
    disabled={
      hasUnavailableProducts
    }
    className="
    px-8 py-6 text-lg rounded-xl
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