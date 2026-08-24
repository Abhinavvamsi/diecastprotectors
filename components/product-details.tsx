"use client"

import { useRouter } from "next/navigation"

import {
  useEffect,
  useState,
} from "react"

import Image from "next/image"

import Navbar from "@/components/navbar"

import { Button } from "@/components/ui/button"
import { formatIndianDisplayDate } from "@/lib/preorder"

import { useCartStore } from "@/store/cart-store"

import { toast } from "sonner"
import {
  getProductPayablePrice,
  getProductRemainingPrice,
} from "@/lib/preorder"
import RecentlyViewedProducts
from "@/components/recently-viewed-products"
import {
  saveRecentlyViewedProduct,
} from "@/lib/recently-viewed"

export default function ProductDetails({
  product,
}: {
  product: any
}) {

  const addToCart = useCartStore(
    (state) => state.addToCart
  )

  const [quantity,
    setQuantity
  ] = useState(1)

  const [selectedImage,
    setSelectedImage
  ] = useState(0)

const [selectedTier,
  setSelectedTier
] = useState<any>(
  null
)

const selectedTierData =
  typeof selectedTier === "number"
    ? product.quantityPricing?.[selectedTier]
    : selectedTier

const selectedPrice =
  selectedTierData
    ? Number(selectedTierData.price)
    : Number(product.price)

const selectedSaleOriginalPrice =
  selectedTierData?.saleOriginalPrice
    ? Number(selectedTierData.saleOriginalPrice)
    : Number(product.saleOriginalPrice || 0)

const siteDiscountPercent =
  Number(product.siteDiscountPercent || 0)

const showRegularSiteDiscount =
  !product.isPreOrder &&
  siteDiscountPercent > 0 &&
  selectedSaleOriginalPrice > selectedPrice

const showPreOrderSiteDiscount =
  Boolean(
    product.isPreOrder &&
    siteDiscountPercent > 0 &&
    selectedSaleOriginalPrice > selectedPrice
  )

const depositPrice = product.isPreOrder
  ? getProductPayablePrice({
      ...product,
      price: selectedPrice,
    })
  : selectedPrice

const remainingPrice = product.isPreOrder
  ? getProductRemainingPrice({
      ...product,
      price: selectedPrice,
    })
  : 0

const availableStock = Number(product.stock || 0)

  const router = useRouter()

  useEffect(() => {
    saveRecentlyViewedProduct({
      ...product,
      price: product.isPreOrder
        ? depositPrice
        : selectedPrice,
      originalPrice: selectedPrice,
      saleOriginalPrice:
        selectedSaleOriginalPrice || undefined,
      siteDiscountPercent:
        siteDiscountPercent || undefined,
      image: product.images?.[0],
      stock: availableStock,
      remainingPrice,
    })
  }, [
    product,
    depositPrice,
    selectedPrice,
    selectedSaleOriginalPrice,
    siteDiscountPercent,
    availableStock,
    remainingPrice,
  ])

  return (

    <>

      <Navbar />

      <main className="min-h-screen bg-[#09090B] text-white pt-24 pb-32 md:pb-0">

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

            {/* LEFT SIDE */}
            <div>

              {/* Main Product Image */}
              <div className="
relative
h-[400px]
md:h-[700px]
rounded-3xl
overflow-hidden
border
border-[#2B2B3A]
bg-[#15151D]
shadow-[0_0_30px_rgba(168,85,247,0.15)]
group
">

                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain group-hover:scale-110 transition duration-700"
                />

              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-4 mt-5 overflow-x-auto pb-2">

                {product.images.map(
                  (
                    image: string,
                    index: number
                  ) => (

                    <button
                      key={index}
                      onClick={() =>
                        setSelectedImage(index)
                      }
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0 ${
                       selectedImage === index
? "border-pink-500 scale-105 shadow-[0_0_15px_rgba(236,72,153,.4)]"
: "border-[#2B2B3A] hover:border-purple-500"
                      }`}
                    >

                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />

                    </button>

                  )
                )}

              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col justify-center">

             {product.brand?.logo && (

  <img
    src={product.brand.logo}
    alt={product.brand.name}
    className="
      h-14
      object-contain
      mb-6
    "
  />

)}

<p className="bg-gradient-to-r
from-pink-500
to-purple-500
bg-clip-text
text-transparent uppercase tracking-widest text-sm font-semibold">

  {product.category}

</p>

              <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

                {product.name}

              </h1>

<p className="text-5xl font-bold mt-6 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

  ₹{product.isPreOrder ? depositPrice : selectedPrice}

</p>

{showRegularSiteDiscount && (
  <p className="mt-2 text-base font-semibold text-zinc-500 line-through">
    ₹{selectedSaleOriginalPrice}
  </p>
)}

{(showRegularSiteDiscount || showPreOrderSiteDiscount) && (
  <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-green-400">
    {siteDiscountPercent}% site-wide offer applied
  </p>
)}

{product.isPreOrder && (
  <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-100">
    <p className="font-semibold">Pre-Order</p>
    <p className="mt-1 text-sm">
      Original price:{" "}
      {showPreOrderSiteDiscount ? (
        <>
          <span className="text-cyan-500/60 line-through">
            ₹{selectedSaleOriginalPrice}
          </span>{" "}
          <span>₹{selectedPrice}</span>
        </>
      ) : (
        <>₹{selectedPrice}</>
      )}
    </p>
    <p className="mt-1 text-sm">Deposit today: ₹{depositPrice}</p>
    <p className="text-sm">Balance due on arrival: ₹{remainingPrice}</p>
	    {product.expectedArrival && (
	      <p className="text-sm">Expected arrival: {product.expectedArrival}</p>
	    )}
	    {product.preOrderDeadline && (
	      <p className="text-sm text-orange-300">Accepting orders until {formatIndianDisplayDate(product.preOrderDeadline)}</p>
	    )}
	  </div>
	)}

              <p className="text-gray-400 mt-8 leading-relaxed text-lg">

                {product.description}

              </p>

              {/* Stock */}
              <p
                className={`mt-6 font-semibold ${
                  product.isPreOrder || product.stock > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >

                {product.isPreOrder
                  ? "Pre-Order"
                  : product.stock > 0
                  ? `In Stock: ${product.stock}`
                  : "Out of Stock"}

              </p>
{product.quantityPricing?.length > 0 && (

  <div className="mt-8">

    <p className="text-sm text-gray-400 mb-4">

      Buy More Save More

    </p>

    <div className="flex flex-wrap gap-3">

      {product.quantityPricing.map(
        (
          tier: any,
          index: number
        ) => (

          <button
            key={index}
            onClick={() => {

  const tierQty =
    Number(
      tier.quantity
    )

  if (
    tierQty >
    product.stock
  ) {

    toast.error(
      `Only ${product.stock} pieces available`
    )

    return

  }

  setQuantity(
    tierQty
  )

  setSelectedTier(
    index
  )

}}
            className={`
              px-5
              py-3
              rounded-full
              border
              transition-all

              ${
               selectedTier === index
? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent"
: "border-[#2B2B3A] text-gray-300 hover:border-pink-500"
              }
            `}
          >

            {tier.quantity}
            {" "}
            pcs @ each ₹ 
            {tier.saleOriginalPrice &&
              Number(tier.saleOriginalPrice) > Number(tier.price) && (
                <span className="mr-1 text-zinc-400 line-through">
                  {tier.saleOriginalPrice}
                </span>
              )}
            {tier.price}

          </button>

        )
      )}

    </div>

  </div>

)}
              {/* Quantity */}
              <div className="mt-10">

                <p className="text-sm text-pink-400 uppercase tracking-wide mb-4">

                  Quantity

                </p>

                <div className="flex items-center gap-4">

                  <button
                    onClick={() =>
                      setQuantity(
                        quantity > 1
                          ? quantity - 1
                          : 1
                      )
                    }
                    className="w-12 h-12 rounded-xl border border-purple-500/40 text-xl hover:border-pink-500 border-purple-500/40
hover:border-pink-500
hover:bg-[#15151D] transition"
                  >

                    -

                  </button>

                  <div className="w-14 text-center text-xl font-bold text-white">

                    {quantity}

                  </div>

  <button
  disabled={
    quantity >= availableStock
  }
  onClick={() => {

    if (
      quantity < availableStock
    ) {

      setQuantity(
        quantity + 1
      )

    }

  }}
  className="
    w-12
    h-12
    rounded-xl
    border
    border-purple-500/40
    text-xl
    hover:border-pink-500

hover:bg-[#15151D]
    transition
    disabled:opacity-40
    disabled:cursor-not-allowed
  "
>

  +

</button>
                </div>

              </div>

              {/* Desktop Buttons */}
              <div className="hidden md:flex flex-col sm:flex-row gap-4 mt-10">

                {/* Add To Cart */}
                <Button
  disabled={availableStock === 0}
  className="
px-8
py-6
text-lg
rounded-xl
text-white
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.45)]
transition-all
duration-300
disabled:opacity-40
"
                  onClick={() => {
if (
  quantity > availableStock
) {

  toast.error(
    `Only ${availableStock} available`
  )

  return

}
                    for (
                      let i = 0;
                      i < quantity;
                      i++
                    ) {

                     addToCart({
  id: product.id,
  name: product.name,

  price: product.isPreOrder ? depositPrice : selectedPrice,

  originalPrice:
    selectedPrice,

  saleOriginalPrice:
    selectedSaleOriginalPrice || undefined,

  siteDiscountPercent:
    siteDiscountPercent || undefined,

  quantityPricing:
    product.quantityPricing,

  image:
    product.images[0],

  stock:
    product.stock,

  isPreOrder:
    product.isPreOrder,

  depositAmount:
    Number(product.depositAmount ?? 50),

	  expectedArrival:
	    product.expectedArrival || undefined,

	  preOrderDeadline:
	    product.preOrderDeadline || undefined,
	})

                    }

                    toast.success(
                      "Added to cart 🛒"
                    )

                  }}
                >

                  Add to Cart

                </Button>

                {/* Buy Now */}
                <Button
  disabled={availableStock === 0}
                  variant="outline"
                  className="
px-8
py-6
text-lg
rounded-xl
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
hover:shadow-[0_0_30px_rgba(236,72,153,.35)]
transition-all
duration-300
disabled:opacity-40
"
                  onClick={() => {
if (
  quantity > availableStock
) {

  toast.error(
    `Only ${availableStock} available`
  )

  return

}
                    for (
                      let i = 0;
                      i < quantity;
                      i++
                    ) {

                      addToCart({
  id: product.id,
  name: product.name,

  price: product.isPreOrder ? depositPrice : selectedPrice,

  originalPrice:
    selectedPrice,

  saleOriginalPrice:
    selectedSaleOriginalPrice || undefined,

  siteDiscountPercent:
    siteDiscountPercent || undefined,

  quantityPricing:
    product.quantityPricing,

  image:
    product.images[0],

  stock:
    product.stock,

  isPreOrder:
    product.isPreOrder,

  depositAmount:
    Number(product.depositAmount ?? 50),

	  expectedArrival:
	    product.expectedArrival || undefined,

	  preOrderDeadline:
	    product.preOrderDeadline || undefined,
	})
                    }

                    router.push(
                      "/checkout"
                    )

                  }}
                >

                  Buy Now

                </Button>

              </div>

            </div>

          </div>

        </div>

        <RecentlyViewedProducts
          currentProductId={product.id}
        />

        {/* Sticky Mobile Buy Bar */}
        {/* Sticky Mobile Buy Bar */}
<div
  className="
  fixed
  bottom-0
  left-0
  right-0
  md:hidden
  z-50
  border-t
  border-[#2B2B3A]
  bg-[#09090B]/95
  backdrop-blur-xl
  px-4
  py-4
  flex
  items-center
  justify-between
  gap-4
  "
>
          {/* Price */}
          <div>

           <p className="text-xs text-gray-400">
  Price
</p>

<h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
  ₹{product.isPreOrder ? depositPrice : selectedPrice}
</h3>

{showRegularSiteDiscount && (
  <p className="mt-1 text-xs text-zinc-500 line-through">
    ₹{selectedSaleOriginalPrice}
  </p>
)}

{(showRegularSiteDiscount || showPreOrderSiteDiscount) && (
  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-green-400">
    {siteDiscountPercent}% off
  </p>
)}

{product.isPreOrder && (
  <p className="mt-1 text-xs text-cyan-300">Deposit today: ₹{depositPrice}</p>
)}

          {product.isPreOrder && (
            <p className="mt-2 text-xs text-zinc-400">
              Original price: ₹{selectedPrice} • Balance due on arrival: ₹{remainingPrice}
            </p>
          )}

          </div>

          {/* Add To Cart */}
          <button
            disabled={availableStock === 0}

            onClick={() => {
if (
  quantity > availableStock
) {

  toast.error(
    `Only ${availableStock} available`
  )

  return

}
              for (
                let i = 0;
                i < quantity;
                i++
              ) {

               addToCart({
  id: product.id,
  name: product.name,

  price: product.isPreOrder ? depositPrice : selectedPrice,

  originalPrice:
    selectedPrice,

  saleOriginalPrice:
    selectedSaleOriginalPrice || undefined,

  siteDiscountPercent:
    siteDiscountPercent || undefined,

  quantityPricing:
    product.quantityPricing,

  image:
    product.images[0],

  stock:
    product.stock,

  isPreOrder:
    product.isPreOrder,

  depositAmount:
    Number(product.depositAmount ?? 50),

	  expectedArrival:
	    product.expectedArrival || undefined,

	  preOrderDeadline:
	    product.preOrderDeadline || undefined,
	})
              }

              toast.success(
                "Added to cart 🛒"
              )

            }}

         className="
flex-1
h-14
rounded-2xl
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
font-bold
text-lg
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.45)]
transition-all
duration-300
disabled:opacity-40
disabled:cursor-not-allowed
"
          >

            {availableStock === 0
              ? "Out of Stock"
              : "Add To Cart"}

          </button>

        </div>

      </main>

    </>

  )

}
