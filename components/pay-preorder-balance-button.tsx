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

export default function PayPreOrderBalanceButton({
  orderId,
  amount,
  disabled = false,
}: {
  orderId: string
  amount: number
  disabled?: boolean
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
        "/api/preorder-balance/create",
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
      const balanceOrder = await response.json()

      if (!response.ok) {
        throw new Error(
          balanceOrder.error ||
            "Unable to start balance payment"
        )
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: balanceOrder.amount,
        currency: balanceOrder.currency,
        name: "Shinsei Diecast",
        description: "Pre-order balance payment",
        order_id: balanceOrder.id,
        handler: async (paymentResponse: any) => {
          const verifyResponse = await fetch(
            "/api/preorder-balance/verify",
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
                "Balance payment verification failed"
            )
          }

          toast.success("Pre-order balance paid successfully")
          router.refresh()
          setLoading(false)
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            window.setTimeout(() => {
              toast.error("Balance payment cancelled")
            }, 180)
          },
        },
        theme: {
          color: "#EC4899",
        },
      })

      razorpay.on("payment.failed", () => {
        window.setTimeout(() => {
          toast.error("Balance payment failed")
        }, 180)
        setLoading(false)
      })

      razorpay.open()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to pay balance"
      )
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading || amount <= 0}
      onClick={handlePayment}
      className="
      inline-flex
      w-full
      min-h-14
      items-center
      justify-center
      rounded-full
      bg-gradient-to-r
      from-cyan-400
      to-blue-500
      px-5
      py-3
      text-sm
      font-bold
      uppercase
      tracking-wider
      text-white
      shadow-[0_0_24px_rgba(34,211,238,0.35)]
      transition-all
      hover:scale-105
      disabled:cursor-not-allowed
      disabled:opacity-50
      disabled:hover:scale-100
      "
    >
      {loading ? "Opening Payment..." : `Pay Balance ₹${amount}`}
    </button>
  )
}
