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
  image: string
  description: string
  stock: number

  quantityPricing?: any[]

  badge?: string
}
export default function ProductCard({

  id,
  name,
  price,
  image,
  description,
  stock,

  quantityPricing,

  badge,

}: ProductCardProps) {

  const addToCart =
    useCartStore(
      (state) => state.addToCart
    )

  const router = useRouter()

  const { user } = useUser()

  return (

    <Link href={`/products/${id}`}>

      <div
  className="
  group
  h-full
  flex
  flex-col
  bg-white
  rounded-3xl
  overflow-hidden
  border
  border-gray-200
  shadow-sm
  hover:border-[#D4AF37]
  hover:-translate-y-1
  hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)]
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
  from-[#111111]/50
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
bg-[#D4AF37]
text-black
text-xs
font-bold
tracking-wider
shadow-lg
"
            >

              {badge}

            </div>

          )}

          {/* Low Stock Badge */}
          {stock > 0 && stock <= 3 && (

            <div
              className="
absolute
top-4
right-4
z-20
px-3
py-1
rounded-full
bg-orange-500
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
          {stock === 0 && (

            <div
              className="
absolute
top-4
right-4
z-20
px-3
py-1
rounded-full
bg-gray-300
text-black
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
  text-black
  min-h-[72px]
  line-clamp-2
  "
>
  {name}
</h3>

          <p
  className="
  text-gray-600
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

            <p className="text-3xl font-bold text-black">

              ₹{price}

            </p>

          </div>

          {/* Stock */}
          <p
            className={`mt-4 font-medium ${
              stock > 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >

            {stock > 0
              ? `In Stock: ${stock}`
              : "Out of Stock"}

          </p>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">

            {/* Add to Cart */}
            <Button
              disabled={stock === 0}

              className="
px-8
py-6
text-lg
rounded-xl

border
border-[#D4AF37]
bg-white
text-black
font-semibold

transition-all
duration-300

hover:bg-[#D4AF37]
hover:text-black
hover:scale-105
hover:-translate-y-1
hover:shadow-[0_10px_30px_rgba(212,175,55,0.25)]

active:scale-95

disabled:opacity-50
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
                  `${name} added to cart 🛒`
                )

              }}
            >

              {stock === 0
                ? "Out of Stock"
                : "Add to Cart"}

            </Button>

            {/* Buy Now */}
            <Button
              disabled={stock === 0}

              variant="outline"

              className="
flex-1
h-12
rounded-xl
text-base
font-semibold
text-[#D4AF37]
border-[#D4AF37]
bg-transparent
hover:bg-[#D4AF37]
hover:text-black
hover:scale-105
hover:shadow-lg
active:scale-95
transition-all
duration-300
disabled:opacity-50
disabled:cursor-not-allowed
group

hover:-translate-y-2

hover:border-[#D4AF37]

hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)]

transition-all

duration-500
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

              {stock === 0
                ? "Unavailable"
                : "Buy Now"}

            </Button>

          </div>

        </div>

      </div>

    </Link>

  )

}