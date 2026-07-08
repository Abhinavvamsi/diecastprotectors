"use client"

import {
  useState,
  useEffect,
} from "react"

import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react"

import Image from "next/image"

import Navbar from "@/components/navbar"

import Link from "next/link"

import { Button } from "@/components/ui/button"

import { useCartStore } from "@/store/cart-store"

import { toast } from "sonner"

import {
  RedirectToSignIn,
  useUser,
} from "@clerk/nextjs"

export default function CheckoutPage() {

  const cart = useCartStore(
    (state) => state.cart
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

  const { user } = useUser()

  const total = cart.reduce(
  (sum, item) => {

    const activeTier =
      item.quantityPricing
        ?.filter(
          (tier) =>
            item.quantity >=
            Number(tier.quantity)
        )
        .sort(
          (a, b) =>
            Number(b.quantity) -
            Number(a.quantity)
        )[0]

    const currentPrice =
      activeTier
        ? Number(activeTier.price)
        : item.originalPrice

    return (
      sum +
      currentPrice *
      item.quantity
    )

  },
  0
)

  const [customer,
    setCustomer
  ] = useState(
    user?.fullName || ""
  )

  const [email,
    setEmail
  ] = useState(
    user?.primaryEmailAddress
      ?.emailAddress || ""
  )

  const [phone,
    setPhone
  ] = useState("")

  const [address,
    setAddress
  ] = useState("")

  const [city,
    setCity
  ] = useState("")

  const [pincode,
    setPincode
  ] = useState("")

  const [suggestions,
  setSuggestions
  ] = useState<any[]>([])

  const [loading,
    setLoading
  ] = useState(false)

  const [couponCode,
  setCouponCode
] = useState("")

const [discount,
  setDiscount
] = useState(0)

const [couponLoading,
  setCouponLoading
] = useState(false)

const [shipping, setShipping] =
  useState<number | null>(null)

const [shippingMessage,
  setShippingMessage
] = useState("")

const [validating,
  setValidating
] = useState(false)

const [pickupEnabled,
  setPickupEnabled
] = useState(false)

const [pickupLocation,
  setPickupLocation
] = useState("")

const [deliveryMethod,
  setDeliveryMethod
] = useState("shipping")

const [suggestedProducts, setSuggestedProducts] =
  useState<any[]>([])

useEffect(() => {

  async function loadSettings() {

    const response =
      await fetch(
        "/api/admin/settings"
      )

    const data =
      await response.json()

    if (data) {
        setPickupEnabled(
  data.pickupEnabled || false
)

setPickupLocation(
  data.pickupLocation || ""
)
      setShipping(
        data.shippingCharge
      )

      setShippingMessage(
        data.shippingMessage || ""
      )

    }

  }

  loadSettings()

}, [])

useEffect(() => {

  async function loadSuggestions() {

    const response =
      await fetch("/api/get-products")

    const data =
      await response.json()

    const cartIds =
      cart.map(item => item.id)

    const suggestions =
      data
        .filter(
          (product: any) =>
            !cartIds.includes(
              product.id
            )
        )
        .slice(0, 4)

    setSuggestedProducts(
      suggestions
    )

  }

  loadSuggestions()

}, [cart])
useEffect(() => {

  if (cart.length === 0) {

    setCouponCode("")
    setDiscount(0)

  }

}, [cart])

useEffect(() => {

  if (!couponCode.trim()) {

    setDiscount(0)

  }

}, [couponCode])

if (!user) {

  return <RedirectToSignIn />

}

async function searchAddress(
  value: string
) {

  setAddress(value)

  if (value.length < 3) {

    setSuggestions([])

    return

  }

  try {

    const response =
      await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          value
        )}&filter=countrycode:in&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
      )

    const data =
      await response.json()

    setSuggestions(
      data.features || []
    )

  } catch (error) {

    console.log(error)

  }

}

async function applyCoupon() {

  if (cart.length === 0) {

    toast.error(
      "Add products before applying coupon"
    )

    return

  }

  if (!couponCode) {

    toast.error(
      "Enter coupon code"
    )

    return

  }

  try {
    setCouponLoading(true)

    const response =
      await fetch(
        "/api/validate-coupon",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

         body: JSON.stringify({

  code:
    couponCode,

  userId:
    user!.id,

  total:
    total,

})

        }
      )

    const data =
      await response.json()

    if (!data.valid) {

  toast.error(
    data.message
  )

  setDiscount(0)

  return

}

    let discountAmount = 0

    if (
      data.coupon.type ===
      "PERCENTAGE"
    ) {

      discountAmount =
        Math.floor(
          total *
          data.coupon.value /
          100
        )

    } else {

      discountAmount =
        data.coupon.value

    }

    setDiscount(
  Math.min(
    discountAmount,
    total
  )
)

    toast.success(
      `Coupon Applied - ₹${discountAmount} Off`
    )

  } catch (error) {

    toast.error(
      "Failed to apply coupon"
    )

  } finally {

    setCouponLoading(false)

  }

}

  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">

          <div>
<p className="uppercase tracking-widest text-sm mb-3 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
  Shinsei Diecast
</p>
            <h1 className="text-4xl md:text-5xl font-bold">

              Checkout

            </h1>

            <p className="mt-4 text-zinc-400">

              Complete your order securely.

            </p>

          </div>

          <Link href="/cart">

            <Button
  variant="outline"
  className="
  rounded-xl
  border-pink-500
text-pink-400
hover:bg-gradient-to-r
hover:from-pink-500
hover:to-purple-600
hover:text-white
hover:border-transparent
  "
>

              Back to Cart

            </Button>

          </Link>

        </div>


        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT SIDE */}
<div>

         <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-sm">

  <h2 className="text-2xl font-bold text-white mb-8">
    Shipping Details
  </h2>

  <div className="space-y-5">

    {/* Row 1 */}
    <div className="grid md:grid-cols-2 gap-4">

      <input
        type="text"
        placeholder="Full Name"
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
        className="
        w-full
        h-16
        rounded-xl
        bg-zinc-950
text-white
border-zinc-700
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
        border
        px-5
        outline-none
        transition
        "
      />

      <input
        type="tel"
        inputMode="numeric"
        maxLength={10}
        placeholder="Phone Number"
        value={phone}
        onChange={(e) =>
          setPhone(
            e.target.value.replace(/\D/g, "")
          )
        }
        className="
        w-full
        h-16
        rounded-xl
        bg-zinc-950
text-white
border-zinc-700
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
        border
        px-5
        outline-none
        transition
        "
      />

    </div>

    {/* Row 2 */}
    <input
      type="email"
      placeholder="Email Address"
      value={email}
      onChange={(e) =>
        setEmail(e.target.value)
      }
      className="
      w-full
      h-16
      rounded-xl
      bg-zinc-950
text-white
border-zinc-700
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
      border
      px-5
      outline-none
      transition
      "
    />

    {/* Address */}
    <div className="relative">

      <textarea
        placeholder="Start typing your address..."
        value={address}
        onChange={(e) =>
          searchAddress(
            e.target.value
          )
        }
        className="
        w-full
        min-h-[140px]
        rounded-xl
        bg-zinc-950
text-white
border-zinc-700
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
        border
        px-5
        py-4
        outline-none
        transition
        "
      />

      {suggestions.length > 0 && (

        <div
          className="
          absolute
          z-50
          mt-2
          w-full
          bg-zinc-900
          border
          border-gray-200
          rounded-xl
          shadow-xl
          overflow-hidden
          "
        >

          {suggestions.map(
            (item, index) => (

            <button
              key={index}
              type="button"
              onClick={() => {

                setAddress(
                  item.properties.formatted
                )

                setCity(
                  item.properties.city ||
                  item.properties.county ||
                  ""
                )

                setPincode(
                  item.properties.postcode ||
                  ""
                )

                setSuggestions([])

              }}
              className="
              w-full
              text-left
              px-4
              py-3
              text-white
              hover:bg-zinc-800
              transition
              "
            >

              {item.properties.formatted}

            </button>

          ))}

        </div>

      )}

    </div>

    {/* Row 3 */}
    <div className="grid md:grid-cols-2 gap-4">

      <input
        type="text"
        placeholder="City"
        value={city}
        onChange={(e) =>
          setCity(
            e.target.value
          )
        }
        className="
        w-full
        h-16
        rounded-xl
        bg-zinc-950
text-white
border-zinc-700
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
        border
        px-5
        outline-none
        transition
        "
      />

      <input
        type="tel"
        inputMode="numeric"
        maxLength={6}
        placeholder="Pincode"
        value={pincode}
        onChange={(e) =>
          setPincode(
            e.target.value.replace(/\D/g, "")
          )
        }
        className="
        w-full
        h-16
        rounded-xl
        bg-zinc-950
text-white
border-zinc-700
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
        border
        px-5
        outline-none
        transition
        "
      />

    </div>

  </div>

</div>
</div>




          {/* RIGHT SIDE */}
<div>

  <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-sm sticky top-24">

    <h2 className="text-2xl font-bold text-white mb-8">
      Order Summary
    </h2>

    <div className="space-y-6">

      {cart.map((item) => (

        <div
          key={item.id}
          className="flex items-center gap-4"
        >

          {/* Product Image */}
          <div
            className="
            relative
            w-20
            h-20
            rounded-xl
            overflow-hidden
            bg-zinc-950
            border
            border-zinc-800
            "
          >

            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-contain"
            />

          </div>

          {/* Product Info */}
          <div className="flex-1">

            <h3 className="font-semibold text-white">

              {item.name}

            </h3>

         <p className="text-pink-400 text-sm font-medium">
Premium Diecast Collectible
</p>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 mt-3">

              <button
  onClick={() =>
    decreaseQuantity(
      item.id
    )
  }
  className="
  w-8
  h-8
  rounded-lg
  border
  border-pink-500
text-pink-400
hover:bg-pink-500
hover:text-black
  text-white
  flex
  items-center
  justify-center
  hover:text-black
  transition
  "
>

  <Minus
    size={14}
    strokeWidth={3}
    className="text-white"
  />

</button>

              <span
                className="
                w-6
                text-center
                font-semibold
                text-white
                "
              >

                {item.quantity}

              </span>

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
  className="
  w-8
  h-8
  rounded-lg
  border
  border-pink-500
text-pink-400
hover:bg-pink-500
hover:text-white
  text-black
  flex
  items-center
  justify-center
  hover:text-black
  transition
  disabled:opacity-40
  "
>

  <Plus
    size={14}
    strokeWidth={3}
    className="text-white"
  />

</button>

              <button
                onClick={() =>
                  removeFromCart(
                    item.id
                  )
                }
                className="
                ml-3
                text-pink-400
hover:text-pink-300
                transition
                "
              >

                <Trash2 size={16} />

              </button>

            </div>

          </div>

          {/* Price */}
          <div className="text-right">

            <p
              className="
              font-bold
text-lg
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-500
bg-clip-text
text-transparent
              "
            >

              ₹{
                (
                  item.quantityPricing
                    ?.filter(
                      (tier) =>
                        item.quantity >=
                        Number(
                          tier.quantity
                        )
                    )
                    .sort(
                      (a, b) =>
                        Number(
                          b.quantity
                        ) -
                        Number(
                          a.quantity
                        )
                    )[0]?.price ||
                  item.originalPrice
                )
              }

            </p>

          </div>

        </div>

      ))}

    </div>

    {/* Empty Cart */}
    {cart.length === 0 && (

      <div
        className="
        mt-6
        p-4
        rounded-xl
        border
        bg-yellow-500/10
border-yellow-500/30
text-yellow-400
        "
      >

        Your cart is empty.
        Add at least one product before checkout.

      </div>

    )}


<div className="mb-8">

  <p className="mb-3 font-semibold text-white">

    Delivery Method

  </p>

  <div className="flex flex-wrap gap-3">

    {/* Shipping */}
    <button
      type="button"
      onClick={() =>
        setDeliveryMethod(
          "shipping"
        )
      }
      className={`
      px-5
      py-3
      rounded-xl
      border
      font-medium
      transition-all
      duration-300

      ${
  deliveryMethod === "shipping"
    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-md"
    : "bg-zinc-950 border-zinc-700 text-zinc-300 hover:border-pink-500 hover:text-white"
}
      `}
    >

      🚚 Shipping

    </button>

    {/* Pickup */}
    {pickupEnabled && (

      <button
        type="button"
        onClick={() =>
          setDeliveryMethod(
            "pickup"
          )
        }
        className={`
        px-5
        py-3
        rounded-xl
        border
        font-medium
        transition-all
        duration-300

        ${
  deliveryMethod === "pickup"
    ? "bg-gradient-to-r from-pink-500 to-purple-600 border-transparent text-white shadow-md"
    : "bg-zinc-950 border-zinc-700 text-zinc-300 hover:border-pink-500 hover:text-white"
}
        `}
      >

        📍 Pickup from {pickupLocation}

      </button>

    )}

  </div>

</div>
<div className="mt-8">

  <p className="mb-3 font-semibold text-white">

    Coupon Code

  </p>

  <div className="flex gap-3">

    <input
      type="text"
      placeholder="WELCOME10"
      value={couponCode}
      onChange={(e) =>
        setCouponCode(
          e.target.value.toUpperCase()
        )
      }
      className="
      flex-1
      h-14
      rounded-xl
     bg-zinc-950
text-white
border-zinc-700
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
      border
      px-5
      outline-none
      transition
      "
    />

    <Button
      type="button"
      onClick={applyCoupon}
      disabled={
        couponLoading ||
        cart.length === 0
      }
      className="
      h-14
      px-6
      rounded-xl
      bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600

hover:scale-105

hover:shadow-[0_0_30px_rgba(236,72,153,.35)]
      text-black
      font-semibold
      hover:shadow-lg
      hover:shadow-[#D4AF37]/20
      transition-all
      duration-300
      disabled:opacity-50
      "
    >

      {couponLoading
        ? "Applying..."
        : "Apply"}

    </Button>

  </div>

</div>
             {/* Totals */}
<div className="border-t border-zinc-800 mt-8 pt-8 space-y-4">

  {/* Subtotal */}
  <div className="flex items-center justify-between text-zinc-400">

    <p>Subtotal</p>

    <p className="font-medium">
      ₹{total}
    </p>

  </div>

  {/* Discount */}
  <div className="flex items-center justify-between text-green-600">

    <p>Discount</p>

    <p className="font-medium">
      -₹{discount}
    </p>

  </div>

  {/* Saved Banner */}
  {discount > 0 && (

    <div
      className="
     bg-green-500/10
border-green-500/30
text-green-400
      rounded-xl
      p-3
      text-sm
      "
    >

      🎉 You Saved ₹{discount}

    </div>

  )}

  {/* Shipping */}
  <div className="flex items-center justify-between text-zinc-400">

    <p>Shipping</p>

    {deliveryMethod === "pickup" ? (

      <p className="text-green-600 font-medium">
        FREE
      </p>

    ) : shipping === null ? (

      <p>Loading...</p>

    ) : shipping > 0 ? (

      <p className="font-medium">
        ₹{shipping}
      </p>

    ) : (

      <p className="text-pink-400 font-medium">
        Actual Charges
      </p>

    )}

  </div>

  {/* Total */}
  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">

    <p className="
font-bold
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-500
bg-clip-text
text-transparent
text-lg
">
      Total
    </p>

    <p className="text-3xl font-bold bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-500
bg-clip-text
text-transparent">

      ₹{
        Math.max(
          0,
          total -
          discount +
          (
            deliveryMethod === "pickup"
              ? 0
              : (shipping || 0)
          )
        )
      }

    </p>

  </div>

</div>

{/* Shipping Message */}
{shipping === 0 && (

  <div
    className="
    mt-6
    p-4
    rounded-xl
    border
    border-pink-500/30
bg-pink-500/10
    "
  >

    <p className="text-pink-300 text-sm font-medium">

      {shippingMessage}

    </p>

  </div>

)}

              {/* Payment Button */}
             <Button
  disabled={
    loading ||
    cart.length === 0 ||
    shipping === null
  }
  
  className="
h-14
rounded-xl
text-lg
mt-10
font-bold
text-white

bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600

hover:scale-[1.02]

hover:shadow-[0_0_40px_rgba(236,72,153,.45)]
transition-all
duration-300
hover:scale-[1.02]
hover:shadow-lg
hover:shadow-pink-500/40
active:scale-95
disabled:opacity-50
disabled:cursor-not-allowed
"

                onClick={async () => {

                  /* Validation */

                  if (customer.trim().length < 3) {

                    toast.error(
                      "Enter valid full name"
                    )

                    return

                  }

                  const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

                  if (!emailRegex.test(email)) {

                    toast.error(
                      "Enter valid email"
                    )

                    return

                  }

                  const phoneRegex =
                    /^[6-9]\d{9}$/

                  if (!phoneRegex.test(phone)) {

                    toast.error(
                      "Enter valid 10-digit phone number"
                    )

                    return

                  }

                  if (address.trim().length < 10) {

                    toast.error(
                      "Enter complete address"
                    )

                    return

                  }

                  const cityRegex =
                    /^[A-Za-z\s]+$/

                  if (!cityRegex.test(city)) {

                    toast.error(
                      "Enter valid city"
                    )

                    return

                  }

                  const pincodeRegex =
                    /^\d{6}$/

                  if (!pincodeRegex.test(pincode)) {

                    toast.error(
                      "Enter valid 6-digit pincode"
                    )

                    return

                  }

                  try {
                  setValidating(true)
                  if (discount > 0 && !couponCode.trim()) {

  toast.error(
    "Please apply coupon again"
  )

  setDiscount(0)

  setLoading(false)

  return

}

const productsResponse =
  await fetch(
    "/api/get-products",
    {
      cache: "no-store",
    }
  )

const products =
  await productsResponse.json()

const validIds =
  products.map(
    (product: any) =>
      product.id
  )

const deletedItems =
  cart.filter(
    (item) =>
      !validIds.includes(
        item.id
      )
  )

if (
  deletedItems.length > 0
) {

  toast.error(
    "Some products in your cart are no longer available"
  )

  setValidating(false)

  return

}

setValidating(false)
                    setLoading(true)

                    const response =
                      await fetch(
                        "/api/create-order",
                        {

                          method: "POST",

                          headers: {
                            "Content-Type":
                              "application/json",
                          },

                          body: JSON.stringify({

                           amount:
  Math.max(
    0,
    total -
discount +
(
  deliveryMethod === "pickup"
    ? 0
    : (shipping || 0)
)
  )

                          }),

                        }
                      )

                    const order =
                      await response.json()

                    const options = {

                      key:
                        process.env
                          .NEXT_PUBLIC_RAZORPAY_KEY_ID,

                      amount:
                        order.amount,

                      currency:
                        order.currency,

                     name: "Shinsei Diecast",
description: "Premium Japanese Diecast Collectibles",

                      order_id:
                        order.id,

                      handler:
                        async function (
                          response: any
                        ) {

                          try {

                            const saveOrderResponse =
                              await fetch(
                                "/api/save-order",
                                {

                                  method:
                                    "POST",

                                  headers: {
                                    "Content-Type":
                                      "application/json",
                                  },

                                  body:
                                    JSON.stringify({
                                        
                                      userId:
                                        user!.id,

                                      customer,

                                      email,

                                      phone,

                                      address,

                                      city,

                                      pincode,

                                      products:
                                        cart,
                                      couponCode,

                                      deliveryMethod,

pickupLocation:
  deliveryMethod === "pickup"
    ? pickupLocation
    : null,

                                      totalAmount:
  Math.max(
    0,
    total -
discount +
(
  deliveryMethod === "pickup"
    ? 0
    : (shipping || 0)
)
  ),

paymentId:
  response.razorpay_payment_id,

                                    }),

                                }
                              )

                            const savedOrder =
                              await saveOrderResponse.json()

                            toast.success(
                              "Payment successful 🎉"
                            )

                            useCartStore
                              .getState()
                              .clearCart()

                            window.location.href =
                              `/success?orderId=${savedOrder.orderId}`

                          } catch (error) {

                            toast.error(
                              "Failed to save order"
                            )

                            setLoading(false)

                          }

                        },

                      modal: {

                        ondismiss: function () {

                          setLoading(false)

                          toast.error(
                            "Payment cancelled"
                          )

                        },

                      },

theme:{
color:"#EC4899"
},

                    }
                                        const stockResponse =
  await fetch(
    "/api/check-stock",
    {

      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({

        products: cart,

      }),

    }
  )
if (couponCode) {

  const couponResponse =
    await fetch(
      "/api/validate-coupon",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          code: couponCode,

          userId: user!.id,

          total: total,

        }),

      }
    )

  const couponData =
    await couponResponse.json()

  if (!couponData.valid) {

    toast.error(
      "Coupon no longer valid for current cart value"
    )

    setLoading(false)

    return

  }

}
const stockData =
  await stockResponse.json()

if (
  !stockResponse.ok
) {

  toast.error(
    stockData.message
  )

  setLoading(false)

  return

}
                    const razorpay =
                      new (
                        window as any
                      ).Razorpay(
                        options
                      )

                    razorpay.open()

                    razorpay.on(
                      "payment.failed",

                      function () {

                        toast.error(
                          "Payment failed"
                        )

                        setLoading(false)

                      }
                    )

                  } catch (error) {

                    toast.error(
                      "Something went wrong"
                    )

                    setLoading(false)

                  }

                }}
              >

                {loading
                  ? "Processing Payment..."
                  : "Proceed to Payment"} 

              </Button>
              <div
  className="
  mt-4
  text-center
  text-xs
  border-pink-500/30
bg-pink-500/10
text-pink-400
  "
>
  🔒 Secure Payment Powered by Razorpay
</div>
<div
  className="
  mt-8
  p-6
  rounded-2xl
  border
  border-purple-500/30
bg-gradient-to-br
from-pink-500/10
to-purple-600/10
  text-center
  "
>

  <h3
    className="
    text-xl
    font-bold
    bg-gradient-to-r
from-pink-500
to-purple-500
bg-clip-text
text-transparent
    "
  >

    🎉 Join the Shinsei Diecast Community

  </h3>

  <p
    className="
    text-zinc-400
    mt-3
    "
  >

    Stay updated with:
    <br />
    ✅ New Arrivals
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
    text-black
    font-bold
    hover:bg-green-600
    "
  >

    🚀 Join WhatsApp Group

  </a>

</div>
<div className="mt-10">

  <h3 className="text-xl font-bold text-white mb-5">

    You May Also Like

  </h3>

  <div className="space-y-4">

    {suggestedProducts.map(
      (product) => (

        <Link
          key={product.id}
          href={`/products/${product.id}`}
        >

          <div
            className="
            flex
            items-center
            gap-4
            p-3
            rounded-2xl
            bg-zinc-900
border-zinc-800
            border
            shadow-sm
            hover:border-pink-500
hover:-translate-y-1
hover:shadow-[0_0_25px_rgba(236,72,153,.25)]
            hover:shadow-md
            transition-all
            duration-300
            "
          >

            <div
              className="
              relative
              w-16
              h-16
              rounded-xl
              overflow-hidden
              bg-zinc-950
border-zinc-800
              border
              "
            >

              <Image
                src={product.images?.[0]}
                alt={product.name}
                fill
                className="object-contain"
              />

            </div>

            <div className="flex-1">

              <p className="font-medium text-white line-clamp-2">

                {product.name}

              </p>

              <p className="text-pink-400 font-semibold mt-1">

                ₹{product.price}

              </p>

            </div>

          </div>

        </Link>

      )
    )}

  </div>

</div>
            </div>

          </div>

        </div>

      </div>

    </main>

  )

}