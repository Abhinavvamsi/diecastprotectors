"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

declare global {
  interface Window {
    Razorpay?: any
  }
}

type RazorpayPaymentResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type MergedShippingOrderResponse = {
  id?: string
  amount?: number
  currency?: string
  freeShipping?: boolean
  error?: string
}

type VerifyMergedShippingResponse = {
  success?: boolean
  error?: string
}

async function readJsonResponse<T extends { error?: string }>(
  response: Response,
  fallbackMessage: string
) {
  const text = await response.text()

  if (!text) {
    return {
      error: fallbackMessage,
    } as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return {
      error: fallbackMessage,
    } as T
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

export default function PayMergedPreOrderShippingButton({
  orderIds,
  amount,
  itemCount,
}: {
  orderIds: string[]
  amount: number
  itemCount: number
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
        "/api/preorder-shipping/merge/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderIds,
          }),
        }
      )
      const shippingOrder =
        await readJsonResponse<MergedShippingOrderResponse>(
          response,
          "Unable to start merged shipping payment"
        )

      if (!response.ok) {
        throw new Error(
          shippingOrder.error ||
            "Unable to start merged shipping payment"
        )
      }

      if (shippingOrder.freeShipping) {
        toast.success("Merged pre-order shipping is free")
        router.refresh()
        setLoading(false)
        return
      }

      if (
        !window.Razorpay ||
        !shippingOrder.id ||
        !shippingOrder.amount ||
        !shippingOrder.currency
      ) {
        throw new Error("Unable to start merged shipping payment")
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: shippingOrder.amount,
        currency: shippingOrder.currency,
        name: "Shinsei Diecast",
        description: "Merged pre-order shipping payment",
        order_id: shippingOrder.id,
        handler: async (
          paymentResponse: RazorpayPaymentResponse
        ) => {
          try {
            const verifyResponse = await fetch(
              "/api/preorder-shipping/merge/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderIds,
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,
                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,
                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                }),
              }
            )
            const verifyData =
              await readJsonResponse<VerifyMergedShippingResponse>(
                verifyResponse,
                "Merged shipping payment verification failed"
              )

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.error ||
                  "Merged shipping payment verification failed"
              )
            }

            toast.success(
              "Merged pre-order shipping paid successfully"
            )
            router.refresh()
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Merged shipping payment verification failed"
            )
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            window.setTimeout(() => {
              toast.error("Merged shipping payment cancelled")
            }, 180)
          },
        },
        theme: {
          color: "#06B6D4",
        },
      })

      razorpay.on("payment.failed", () => {
        window.setTimeout(() => {
          toast.error("Merged shipping payment failed")
        }, 180)
        setLoading(false)
      })

      razorpay.open()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to pay merged shipping"
      )
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      disabled={loading || amount <= 0 || orderIds.length < 2}
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
      shadow-[0_0_30px_rgba(34,211,238,0.35)]
      transition-all
      hover:scale-105
      disabled:cursor-not-allowed
      disabled:opacity-50
      disabled:hover:scale-100
      "
    >
      {loading
        ? "Opening Payment..."
        : `Merge Shipping ₹${amount} (${itemCount} items)`}
    </button>
  )
}
