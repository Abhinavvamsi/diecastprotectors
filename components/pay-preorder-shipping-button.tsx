"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

declare global {
  interface Window {
    Razorpay?: any
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PayPreOrderShippingButton({
  orderId,
  amount,
}: {
  orderId: string
  amount: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handlePayment() {
    try {
      setLoading(true)

      const loaded = await loadRazorpayScript()

      if (!loaded) {
        throw new Error("Unable to load Razorpay")
      }

      const response = await fetch(
        "/api/preorder-shipping/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        }
      )
      const shippingOrder = await response.json()

      if (!response.ok) {
        throw new Error(
          shippingOrder.error ||
            "Unable to start shipping payment"
        )
      }

      if (shippingOrder.freeShipping) {
        toast.success("Pre-order shipping is free for this batch")
        router.refresh()
        setLoading(false)
        return
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: shippingOrder.amount,
        currency: shippingOrder.currency,
        name: "Shinsei Diecast",
        description: "Pre-order shipping payment",
        order_id: shippingOrder.id,
        handler: async (paymentResponse: any) => {
          const verifyResponse = await fetch(
            "/api/preorder-shipping/verify",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }),
            }
          )
          const verifyData = await verifyResponse.json()

          if (!verifyResponse.ok) {
            throw new Error(
              verifyData.error ||
                "Shipping payment verification failed"
            )
          }

          toast.success("Pre-order shipping paid successfully")
          router.refresh()
          setLoading(false)
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
        theme: {
          color: "#06B6D4",
        },
      })

      razorpay.on("payment.failed", () => {
        toast.error("Shipping payment failed")
        setLoading(false)
      })

      razorpay.open()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to pay shipping"
      )
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading || amount <= 0}
      onClick={handlePayment}
      className="
      inline-flex
      w-full
      min-h-14
      items-center
      justify-center
      rounded-full
      border
      border-cyan-400/40
      bg-cyan-500/10
      px-5
      py-3
      text-sm
      font-bold
      uppercase
      tracking-wider
      text-cyan-100
      shadow-[0_0_24px_rgba(34,211,238,0.22)]
      transition-all
      hover:scale-105
      disabled:cursor-not-allowed
      disabled:opacity-50
      disabled:hover:scale-100
      "
    >
      {loading ? "Opening Payment..." : `Pay Shipping ₹${amount}`}
    </button>
  )
}
