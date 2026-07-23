"use client"

import {
  useState,
  useEffect,
  useRef,
} from "react"

import {
  Minus,
  Plus,
  Trash2,
  Loader2,
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
import {
  calculateShippingCharge,
  getAmountNeededForFreeShipping,
  getFreeShippingProgress,
} from "@/lib/shipping"
import { getProductPayablePrice } from "@/lib/preorder"

type SavedCheckoutAddress = {
  name: string
  address: string
  city: string
  pincode: string
  updatedAt: string
}

export default function CheckoutPage() {

  const cart = useCartStore(
    (state) => state.cart
  )
  const syncProduct =
    useCartStore(
      (state) => state.syncProduct
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

  useEffect(() => {
    async function refreshCartPrices() {
      const response = await fetch(
        "/api/get-products?includePreOrder=true",
        { cache: "no-store" }
      )

      if (!response.ok) return

      const products = await response.json()
      for (const product of products) {
        syncProduct({
          id: product.id,
          price: getProductPayablePrice(product),
          originalPrice: Number(product.price || 0),
          depositAmount: product.depositAmount,
          expectedArrival: product.expectedArrival || undefined,
          isPreOrder: product.isPreOrder,
          stock: product.stock,
          name: product.name,
          image: product.images?.[0] || product.image || "",
          quantityPricing: product.quantityPricing,
        })
      }
    }

    refreshCartPrices()
  }, [syncProduct])

  const total = cart.reduce(
  (sum, item) => {

    const currentPrice =
      Number(item.originalPrice ?? 0)

    if (item.isPreOrder) {
      return sum + Number(item.price ?? 0) * item.quantity
    }

    return (
      sum +
      currentPrice *
      item.quantity
    )

  },
  0
)

const itemCount = cart.reduce(
  (sum, item) => sum + item.quantity,
  0
)

const subtotalForShipping = total

const hasPreOrderItems = cart.some(
  (item) => item.isPreOrder
)

const hasOnlyPreOrderItems =
  cart.length > 0 &&
  cart.every((item) => item.isPreOrder)

const amountNeededForFreeShipping =
  getAmountNeededForFreeShipping(subtotalForShipping)

const freeShippingProgress =
  getFreeShippingProgress(subtotalForShipping)

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

const [savedAddresses,
  setSavedAddresses
] = useState<SavedCheckoutAddress[]>([])

const [selectedSavedAddress,
  setSelectedSavedAddress
] = useState<number | null>(null)

  const [suggestions,
  setSuggestions
  ] = useState<any[]>([])

  const [loading,
    setLoading
  ] = useState(false)

const [couponCode,
  setCouponCode
] = useState("")

const [appliedCouponCode,
  setAppliedCouponCode
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

const [reservationId, setReservationId] =
  useState<string | null>(null)

const [reservationExpiresAt,
  setReservationExpiresAt
] = useState<string | null>(null)

const reservationIdRef =
  useRef<string | null>(null)

const activeReservationStorageKey =
  "active-checkout-reservation-id"

const cancelReservationSilently =
  async (id: string) => {
    try {
      const payload = JSON.stringify({
        reservationId: id,
      })

      if (
        typeof navigator !== "undefined" &&
        "sendBeacon" in navigator
      ) {
        navigator.sendBeacon(
          "/api/reservations/cancel",
          new Blob([payload], {
            type: "application/json",
          })
        )
        return
      }

      await fetch(
        "/api/reservations/cancel",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: payload,
          keepalive: true,
        }
      )
    } catch {
      // Best-effort cleanup when the page is leaving.
    }
  }

const clearStoredReservation = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(
      activeReservationStorageKey
    )
  }
}

function formatIstTime(value: string) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }
  ).format(new Date(value))
}

const savedAddressesStorageKey = user
  ? `saved-checkout-addresses-${user.id}`
  : null

function normalizeAddress(address: SavedCheckoutAddress) {
  return {
    ...address,
    name: address.name.trim(),
    address: address.address.trim(),
    city: address.city.trim(),
    pincode: address.pincode.trim(),
  }
}

function readSavedAddresses() {
  if (!savedAddressesStorageKey) return []

  try {
    const raw =
      localStorage.getItem(
        savedAddressesStorageKey
      )

    if (!raw) return []

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) return []

    return parsed.slice(0, 2)
  } catch {
    return []
  }
}

function writeSavedAddresses(
  nextAddresses: SavedCheckoutAddress[]
) {
  if (!savedAddressesStorageKey) return

  localStorage.setItem(
    savedAddressesStorageKey,
    JSON.stringify(nextAddresses.slice(0, 2))
  )
}

function applySavedAddress(
  savedAddress: SavedCheckoutAddress,
  index: number
) {
  setAddress(savedAddress.address)
  setCity(savedAddress.city)
  setPincode(savedAddress.pincode)
  setSelectedSavedAddress(index)
}

function saveCurrentAddress() {
  const nextAddress = normalizeAddress({
    name: `Address ${
      selectedSavedAddress !== null
        ? selectedSavedAddress + 1
        : savedAddresses.length + 1
    }`,
    address,
    city,
    pincode,
    updatedAt: new Date().toISOString(),
  })

  if (!nextAddress.address || !nextAddress.city || !nextAddress.pincode) {
    toast.error("Fill address, city and pincode first")
    return
  }

  if (selectedSavedAddress !== null) {
    const nextAddresses = [...savedAddresses]
    nextAddresses[selectedSavedAddress] = nextAddress
    setSavedAddresses(nextAddresses)
    writeSavedAddresses(nextAddresses)
    toast.success("Address updated")
    return
  }

  if (savedAddresses.length >= 2) {
    toast.error("You can save only 2 addresses")
    return
  }

  const nextAddresses = [...savedAddresses, nextAddress]
  setSavedAddresses(nextAddresses)
  writeSavedAddresses(nextAddresses)
  setSelectedSavedAddress(nextAddresses.length - 1)
  toast.success("Address saved")
}

useEffect(() => {

  const staleReservationId =
    sessionStorage.getItem(
      activeReservationStorageKey
    )

  if (staleReservationId) {
    void cancelReservationSilently(
      staleReservationId
    )
    clearStoredReservation()
  }

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

      setShippingMessage(
        data.shippingMessage || ""
      )

    }

  }

  loadSettings()

}, [])

useEffect(() => {
  setShipping(
    calculateShippingCharge({
      subtotal: total,
      itemCount,
      deliveryMethod,
      hasOnlyPreOrderItems,
    })
  )
}, [total, itemCount, deliveryMethod, hasOnlyPreOrderItems])

useEffect(() => {

  async function loadSuggestions() {

    const response =
      await fetch("/api/get-products?includePreOrder=true")

    const data =
      await response.json()

    const cartIds =
      cart.map(item => item.id)

    const suggestions =
      data
        .filter(
          (product: any) =>
            Math.max(
              0,
              Number(product.stock || 0) -
                Number(product.reservedStock || 0)
            ) > 0
        )
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

useEffect(() => {
  let cancelled = false

  async function syncAppliedCouponWithCart() {
    if (!appliedCouponCode.trim() || !user?.id || discount <= 0) return

    try {
      const response = await fetch("/api/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: appliedCouponCode.trim(),
          userId: user.id,
          total,
        }),
      })

      const data = await response.json()

      if (cancelled) return

      if (!response.ok || !data.valid) {
        setDiscount(0)
        return
      }

      const discountAmount =
        data.coupon.type === "PERCENT" ||
        data.coupon.type === "PERCENTAGE"
          ? Math.floor((total * Number(data.coupon.value)) / 100)
          : Number(data.coupon.value || 0)

      setDiscount(Math.min(discountAmount, total))
    } catch {
      if (!cancelled) {
        setDiscount(0)
      }
    }
  }

  syncAppliedCouponWithCart()

  return () => {
    cancelled = true
  }
}, [total, appliedCouponCode, user?.id, discount])

useEffect(() => {
  if (!savedAddressesStorageKey) return

  const existing = readSavedAddresses()
  setSavedAddresses(existing)
}, [savedAddressesStorageKey])

useEffect(() => {

  if (!reservationId) return

  const handlePageExit = () => {
    const activeReservation =
      reservationIdRef.current ||
      sessionStorage.getItem(
        activeReservationStorageKey
      )

    if (activeReservation) {
      void cancelReservationSilently(
        activeReservation
      )
    }
  }

  window.addEventListener(
    "pagehide",
    handlePageExit
  )
  window.addEventListener(
    "beforeunload",
    handlePageExit
  )
  window.addEventListener(
    "unload",
    handlePageExit
  )

  return () => {
    window.removeEventListener(
      "pagehide",
      handlePageExit
    )
    window.removeEventListener(
      "beforeunload",
      handlePageExit
    )
    window.removeEventListener(
      "unload",
      handlePageExit
    )
    if (reservationIdRef.current) {
      void cancelReservationSilently(
        reservationIdRef.current
      )
    }
    clearStoredReservation()
  }

}, [reservationId])

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

async function cancelReservation(
  id: string
) {

  try {
    await cancelReservationSilently(id)
  } finally {
    reservationIdRef.current = null
    setReservationId(null)
    setReservationExpiresAt(null)
    clearStoredReservation()
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
      "PERCENT" ||
      data.coupon.type === "PERCENTAGE"
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
    setAppliedCouponCode(couponCode.trim())

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

    <main className="relative min-h-screen overflow-hidden bg-[#09090B] text-white">

      {/* Navbar */}
      <Navbar />
      <div className="pointer-events-none absolute -top-20 right-0 h-[460px] w-[460px] rounded-full bg-fuchsia-500/10 blur-[150px] animate-pulse" />
      <div className="pointer-events-none absolute left-0 top-1/3 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse" />

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

         <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-[0_0_40px_rgba(236,72,153,.08)] transition-all duration-300 hover:border-pink-500/40 hover:shadow-[0_0_55px_rgba(236,72,153,.18)]">

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

    {/* Saved Addresses */}
    <div className="mb-5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Saved Addresses
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Save up to 2 addresses and reuse them anytime.
          </p>
        </div>

        <Button
          type="button"
          onClick={saveCurrentAddress}
          className="
          h-10
          rounded-lg
          bg-gradient-to-r
          from-pink-500
          via-fuchsia-500
          to-purple-600
          text-white
          px-4
          "
        >
          {selectedSavedAddress !== null
            ? "Update Saved Address"
            : "Save Address"}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mt-4">
        {[0, 1].map((index) => {
          const savedAddress = savedAddresses[index]

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (savedAddress) {
                  applySavedAddress(savedAddress, index)
                  return
                }

                setSelectedSavedAddress(index)
              }}
              className={`
                rounded-xl border p-4 text-left transition
                ${
                  selectedSavedAddress === index
                    ? "border-pink-500 bg-pink-500/10"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">
                  Address {index + 1}
                </p>
                <span className="text-[11px] uppercase tracking-widest text-zinc-400">
                  {savedAddress ? "Saved" : "Empty"}
                </span>
              </div>

              {savedAddress ? (
                <div className="mt-3 space-y-1 text-sm text-zinc-300">
                  <p>{savedAddress.address}</p>
                  <p>
                    {savedAddress.city} - {savedAddress.pincode}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-500">
                  Click to reserve this slot and save the current address here.
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>

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

  <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-[0_0_40px_rgba(168,85,247,.08)] transition-all duration-300 hover:border-pink-500/40 hover:shadow-[0_0_55px_rgba(168,85,247,.18)] sticky top-24">

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
                item.isPreOrder
                  ? Number(item.price ?? 0) * Number(item.quantity ?? 0)
                  : (
                      (Number(
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
                          )[0]?.price
                      ) || Number(item.originalPrice ?? 0)) *
                      Number(item.quantity ?? 0)
                    )
              }

            </p>

            {item.isPreOrder && (() => {
              const quantity = Number(item.quantity ?? 0)
              const originalUnitPrice = Number(item.originalPrice ?? 0)
              const depositUnitPrice = Number(item.price ?? 0)
              const originalLinePrice = originalUnitPrice * quantity
              const depositLinePrice = depositUnitPrice * quantity
              const remainingLinePrice = Math.max(
                0,
                originalLinePrice - depositLinePrice
              )

              return (
                <div className="mt-2 text-xs text-cyan-300 space-y-1">
                  <p>Original price: ₹{originalLinePrice}</p>
                  <p className="font-semibold text-cyan-300">Deposit today: ₹{depositLinePrice}</p>
                  <p>Balance due on arrival: ₹{remainingLinePrice}</p>
                </div>
              )
            })()}

            {!item.isPreOrder && (
              <p className="mt-2 text-xs text-zinc-400">
                Original price: ₹{Number(item.originalPrice ?? 0) * Number(item.quantity ?? 0)}
              </p>
            )}

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

  {hasPreOrderItems && (
    <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
      {hasOnlyPreOrderItems
        ? "Your cart contains pre-order items only. You will pay the deposit today, and the balance plus any applicable shipping charges will be collected when the products arrive."
        : "Your cart contains pre-order items. You will pay the deposit today, and the balance will be collected when the products arrive."}
    </div>
  )}

  {/* Discount */}
  {discount > 0 && (
    <div className="flex items-center justify-between text-green-600">

      <p>Discount</p>

      <p className="font-medium">
        -₹{discount}
      </p>

    </div>
  )}

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

    ) : hasOnlyPreOrderItems ? (

      <p className="text-cyan-300 font-medium">
        Collected later
      </p>

    ) : subtotalForShipping >= 10000 ? (

      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400" />
        </span>

        <p className="font-semibold text-green-400">
          FREE SHIPPING UNLOCKED
        </p>
      </div>

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

  {deliveryMethod !== "pickup" && !hasOnlyPreOrderItems && (
    <div className={`rounded-2xl border p-4 ${
      subtotalForShipping >= 10000
        ? "border-green-500/30 bg-green-500/10"
        : "border-pink-500/20 bg-pink-500/5"
    }`}>
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-zinc-400">
        <span>Free Shipping Progress</span>
        {amountNeededForFreeShipping > 0 ? (
          <span>₹{amountNeededForFreeShipping} more to go</span>
        ) : (
          <span className="text-green-400">Free shipping unlocked</span>
        )}
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            subtotalForShipping >= 10000
              ? "bg-gradient-to-r from-green-400 via-emerald-400 to-lime-400 animate-pulse"
              : "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500"
          }`}
          style={{
            width: `${Math.max(4, freeShippingProgress * 100)}%`,
          }}
        />
      </div>

      <div className={`mt-2 text-sm ${
        subtotalForShipping >= 10000 ? "text-green-300" : "text-zinc-400"
      }`}>
        {subtotalForShipping >= 10000
          ? "You have unlocked free shipping."
          : "Add more items to unlock free shipping at ₹10,000."}
      </div>
    </div>
  )}

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

                  setLoading(true)
                  setValidating(true)
                  const cartSnapshot = Array.from(
                    cart.reduce((map, item) => {
                      const existing = map.get(item.id)
                      if (existing) {
                        existing.quantity += item.quantity
                        return map
                      }

                      map.set(item.id, {
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        originalPrice: item.originalPrice,
                        price: item.price,
                        image: item.image,
                        quantityPricing: item.quantityPricing,
                      })
                      return map
                    }, new Map<string, any>())
                  .values())

                  /* Validation */

                  if (customer.trim().length < 3) {

                    toast.error(
                      "Enter valid full name"
                    )

                    setLoading(false)
                    setValidating(false)

                    return

                  }

                  const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

                  if (!emailRegex.test(email)) {

                    toast.error(
                      "Enter valid email"
                    )

                    setLoading(false)
                    setValidating(false)

                    return

                  }

                  const phoneRegex =
                    /^[6-9]\d{9}$/

                  if (!phoneRegex.test(phone)) {

                    toast.error(
                      "Enter valid 10-digit phone number"
                    )

                    setLoading(false)
                    setValidating(false)

                    return

                  }

                  if (address.trim().length < 10) {

                    toast.error(
                      "Enter complete address"
                    )

                    setLoading(false)
                    setValidating(false)

                    return

                  }

                  const cityRegex =
                    /^[A-Za-z\s]+$/

                  if (!cityRegex.test(city)) {

                    toast.error(
                      "Enter valid city"
                    )

                    setLoading(false)
                    setValidating(false)

                    return

                  }

                  const pincodeRegex =
                    /^\d{6}$/

                  if (!pincodeRegex.test(pincode)) {

                    toast.error(
                      "Enter valid 6-digit pincode"
                    )

                    setLoading(false)
                    setValidating(false)

                    return

                  }

                  try {
                  if (discount > 0 && !couponCode.trim()) {

  toast.error(
    "Please apply coupon again"
  )

  setDiscount(0)

  setLoading(false)
  setValidating(false)

  return

}

const stockCheckResponse =
  await fetch(
    "/api/check-stock",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
        body: JSON.stringify({
        products: cartSnapshot.map(
          (item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
          })
        ),
      }),
    }
  )

const stockCheck =
  await stockCheckResponse.json()

if (!stockCheckResponse.ok || !stockCheck.valid) {

  toast.error(
    stockCheck.message ||
      "Some products in your cart are no longer available"
  )

  setValidating(false)
  setLoading(false)

  return

}

setValidating(false)
                    const reservationResponse =
                      await fetch(
                        "/api/reservations/create",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            items: cartSnapshot.map((item) => ({
                              productId: item.id,
                              quantity: item.quantity,
                            })),
                          }),
                        }
                      )

                    const reservationData =
                      await reservationResponse.json()

                    if (!reservationResponse.ok) {
                      toast.error(
                        reservationData.error ||
                        "Unable to reserve these products"
                      )
                      setLoading(false)
                      return
                    }

                    const activeReservationId =
                      reservationData.reservation.id

                    reservationIdRef.current =
                      activeReservationId
                    setReservationId(activeReservationId)
                    setReservationExpiresAt(
                      reservationData.reservation.expiresAt
                    )
                    sessionStorage.setItem(
                      activeReservationStorageKey,
                      activeReservationId
                    )
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
                            reservationId: activeReservationId,
                            couponCode,
                            deliveryMethod,
                          }),

                        }
                      )

                    const order =
                      await response.json()

                    if (!response.ok) {
                      await cancelReservation(
                        activeReservationId
                      )
                      throw new Error(
                        order.error ||
                        "Failed to start payment"
                      )
                    }

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

                            const pendingOrder = {
                              userId: user!.id,
                              customer,
                              email,
                              phone,
                              address,
                              city,
                              pincode,
                              products: cartSnapshot.map((item) => ({
                                id: item.id,
                                name: item.name,
                                quantity: item.quantity,
                                price:
                                  item.isPreOrder
                                    ? Number(item.price ?? 0)
                                    : Number(
                                        (item.quantityPricing as any[] | undefined)?.filter(
                                          (tier: any) =>
                                            item.quantity >=
                                            Number(tier.quantity)
                                        ).sort(
                                          (a: any, b: any) =>
                                            Number(b.quantity) -
                                            Number(a.quantity)
                                        )[0]?.price
                                      ) || item.originalPrice,
                                originalPrice: item.originalPrice,
                                depositAmount: item.depositAmount,
                                image: item.image,
                                images: item.image ? [item.image] : [],
                                quantityPricing: item.quantityPricing || [],
                              })),
                              reservationId: activeReservationId,
                              couponCode,
                              deliveryMethod,
                              pickupLocation:
                                deliveryMethod === "pickup"
                                  ? pickupLocation
                                  : null,
                              totalAmount: Math.max(
                                0,
                                total -
                                  discount +
                                  (deliveryMethod === "pickup"
                                    ? 0
                                    : (shipping || 0))
                              ),
                              paymentId:
                                response.razorpay_payment_id,
                              razorpay_order_id:
                                response.razorpay_order_id,
                              razorpay_payment_id:
                                response.razorpay_payment_id,
                              razorpay_signature:
                                response.razorpay_signature,
                            }

                            sessionStorage.setItem(
                              "pending-order",
                              JSON.stringify(pendingOrder)
                            )

                            reservationIdRef.current = null
                            setReservationId(null)
                            setReservationExpiresAt(null)
                            clearStoredReservation()

                            window.location.replace(
                              "/processing"
                            )

                          } catch (error) {

                            toast.error(
                              "Payment received, but the order could not be saved. Please contact support."
                            )

                            setLoading(false)

                          }

                        },

                      modal: {

                        ondismiss: function () {

                          void cancelReservation(
                            activeReservationId
                          )

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

    await cancelReservation(
      activeReservationId
    )

    return

  }

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

                    if (reservationIdRef.current) {
                      await cancelReservation(
                        reservationIdRef.current
                      )
                    }

                    toast.error(
                      "Something went wrong"
                    )

                    setLoading(false)
                    setValidating(false)

                  }

                }}
              >

                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Payment...
                  </span>
                ) : (
                  "Proceed to Payment"
                )} 

              </Button>

              {reservationExpiresAt && (
                <div className="mt-4 rounded-xl border border-pink-500/20 bg-pink-500/10 px-4 py-3 text-sm text-pink-200">
                  Pre-order held until{" "}
                  <span className="font-semibold">
                    {formatIstTime(
                      reservationExpiresAt
                    )}
                  </span>
                </div>
              )}

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

    Join the Shinsei Diecast Community

  </h3>

  <p
    className="
    text-zinc-400
    mt-3
    "
  >

    Stay updated with:
    <br />
    ✅ New arrivals
    <br />
    ✅ Upcoming releases
    <br />
    ✅ Exclusive offers
    <br />
    ✅ Collector updates

  </p>

  <a
    href="https://chat.whatsapp.com/LXeocqm0ctA0ohmQSNfP0t?s=cl&p=a&ilr=1&amv=2"
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

    Join WhatsApp Community

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
