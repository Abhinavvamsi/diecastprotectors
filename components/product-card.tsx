"use client"

import Link from "next/link"

import Image from "next/image"

import { Button } from "@/components/ui/button"

import { useCartStore } from "@/store/cart-store"

import { useRouter } from "next/navigation"

import { useUser } from "@clerk/nextjs"

import { toast } from "sonner"

type ProductCardProps = {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  description: string
  stock: number
  isPreOrder?: boolean
  depositAmount?: number
  expectedArrival?: string | null
  remainingPrice?: number

  quantityPricing?: any[]

  badge?: string
}

const CARS_LAST_PRODUCT_KEY =
  "cars-last-product-id"

export default function ProductCard({

  id,
  name,
  price,
  originalPrice,
  image,
  description,
  stock,
  isPreOrder,
  depositAmount,
  expectedArrival,
  remainingPrice,

  quantityPricing,

  badge,

}: ProductCardProps) {
  const isOutOfStock = Number(stock || 0) <= 0
  const isLowStock =
    Number(stock || 0) > 0 &&
    Number(stock || 0) <= 3

  const addToCart =
    useCartStore(
      (state) => state.addToCart
    )

  const router = useRouter()

  const { user } = useUser()

  const saveProductPosition = () => {
    if (window.location.pathname !== "/cars") return

    sessionStorage.setItem(
      CARS_LAST_PRODUCT_KEY,
      id
    )
  }

  return (

    <Link
  href={`/products/${id}`}
  prefetch
  onNavigate={saveProductPosition}
>

      <div
  className="
  group
relative
overflow-hidden
  h-full
  flex
  flex-col
  bg-[#15151D]
  rounded-3xl
  overflow-hidden
  border
  border-[#2B2B3A]
  shadow-sm
  hover:border-pink-500
hover:-translate-y-2
hover:shadow-[0_0_35px_rgba(236,72,153,0.35)]
  transition-all
  duration-500
  cursor-pointer
  "
>

        {/* Product Image */}
        <div className="relative h-72 overflow-hidden">

          <Image
            src={image}
            alt={name}
            fill
            className="
object-contain
p-3
group-hover:scale-110
transition-transform
duration-700
"
          />

          {/* Gradient Overlay */}
          <div
  className="
  absolute
  inset-0
  z-10
  bg-gradient-to-t
  from-[#09090B]/80
via-purple-900/20
to-transparent
  to-transparent
  opacity-0
  group-hover:opacity-100
  transition
  duration-500
  "
/>

          {/* Dynamic Badge */}
          {badge && (

            <div
              className="
absolute
top-4
left-4
z-20
px-3
py-1
rounded-full
bg-gradient-to-r
from-pink-500
to-purple-600
text-white
text-xs
font-bold
tracking-wider
shadow-lg
"
            >

              {badge}

            </div>

          )}

          {isPreOrder && (
            <div className="absolute top-4 left-4 z-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              PRE ORDER
            </div>
          )}

          {/* Low Stock Badge */}
          {isLowStock && (

            <div
              className="
absolute
top-4
right-4
z-20
px-3
py-1
rounded-full
bg-gradient-to-r
from-orange-500
to-red-500
text-white
text-xs
font-bold
shadow-lg
"
            >

              LOW STOCK

            </div>

          )}

          {/* Out of Stock */}
          {isOutOfStock && (

            <div
              className="
absolute
top-4
right-4
z-20
px-3
py-1
rounded-full
bg-red-500
text-white
text-xs
font-bold
shadow-lg
"
            >

              SOLD OUT

            </div>

          )}

        </div>

        {/* Product Info */}
        <div className="p-6 flex flex-col flex-1">

          <h3
  className="
  text-2xl
  font-bold
  text-white
  min-h-[72px]
  line-clamp-2
  "
>
  {name}
</h3>

          <p
  className="
  text-gray-400
  mt-3
  leading-relaxed
  line-clamp-2
  min-h-[52px]
  "
>

            {description}

          </p>

          {/* Price */}
          <div className="mt-auto">

            <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

              ₹{price}

            </p>

            {isPreOrder && (
              <div className="mt-2 space-y-1 text-sm text-cyan-300">
                <p>Original price: ₹{originalPrice ?? price}</p>
                <p>Deposit today: ₹{price}</p>
                <p>Balance due on arrival: ₹{remainingPrice ?? 0}{expectedArrival ? ` • Arrives ${expectedArrival}` : ""}</p>
              </div>
            )}

          </div>

          {/* Stock */}
          <p
            className={`mt-4 font-medium ${
              Number(stock || 0) > 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >

              {isPreOrder
              ? "Pre-Order"
              : Number(stock || 0) > 0
              ? `In Stock: ${stock}`
              : "Out of Stock"}

          </p>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">

            {/* Add to Cart */}
            <Button
              disabled={isOutOfStock}

              className="
flex-1
h-12
rounded-xl
font-semibold
text-white
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,0.45)]
transition-all
duration-300
disabled:opacity-40
"

              onClick={(e) => {

                e.preventDefault()

                if (!user) {

                  toast.error(
                    "Please login first"
                  )

                  router.push("/sign-in")

                  return

                }

                addToCart({
  id,
  name,

  price,

  originalPrice:
    price,

  quantityPricing:
    quantityPricing,

  image,

  stock,

  isPreOrder,

  depositAmount,

  expectedArrival:
    expectedArrival || undefined,
})

                toast.success(
                  `${name} added to cart 🛒`
                )

              }}
            >

              {isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}

            </Button>

            {/* Buy Now */}
            <Button
              disabled={isOutOfStock}

              variant="outline"

             className="
flex-1
h-12
rounded-xl
font-semibold
border
border-pink-500
text-pink-400
bg-transparent
hover:bg-gradient-to-r
hover:from-pink-500
hover:to-purple-600
hover:text-white
hover:border-transparent
hover:scale-105
hover:shadow-[0_0_30px_rgba(236,72,153,0.35)]
transition-all
duration-300
disabled:opacity-40
"
              onClick={(e) => {

                e.preventDefault()

                if (!user) {

                  toast.error(
                    "Please login first"
                  )

                  router.push("/sign-in")

                  return

                }

                addToCart({
  id,
  name,

  price,

  originalPrice:
    price,

  quantityPricing:
    quantityPricing,

  image,

  stock,
})

                toast.success(
                  "Redirecting to checkout 🚀"
                )

                router.push("/checkout")

              }}
            >

              {isOutOfStock ? "Unavailable" : "Buy Now"}

            </Button>

          </div>

        </div>

      </div>

    </Link>

  )

}
