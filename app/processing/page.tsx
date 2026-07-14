"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useCartStore } from "@/store/cart-store"

export default function ProcessingPage() {
  const [message, setMessage] = useState(
    "Your payment is confirmed. We are saving your order now."
  )

  useEffect(() => {
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    async function savePendingOrder() {
      const trySave = async (): Promise<boolean> => {
        const rawPendingOrder = sessionStorage.getItem("pending-order")

        if (!rawPendingOrder) {
          return false
        }

        const pendingOrder = JSON.parse(rawPendingOrder)
        const saveOrderResponse = await fetch("/api/save-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pendingOrder),
        })

        const savedOrder = await saveOrderResponse.json()

        if (!saveOrderResponse.ok) {
          throw new Error(savedOrder.error || "Failed to save order")
        }

        sessionStorage.removeItem("pending-order")
        useCartStore.getState().clearCart()

        if (!cancelled) {
          window.location.replace(`/success?orderId=${savedOrder.orderId}`)
        }

        return true
      }

      const attemptLoop = async () => {
        if (cancelled) return

        try {
          setMessage("Saving your order securely...")
          const saved = await trySave()

          if (!saved && !cancelled) {
            setMessage("Finalizing your order. Please keep this page open.")
            timeoutId = setTimeout(attemptLoop, 1200)
          }
        } catch {
          if (cancelled) return
          setMessage("Still working on it... please wait a moment.")
          timeoutId = setTimeout(attemptLoop, 1800)
        }
      }

      void attemptLoop()
    }

    void savePendingOrder()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-2xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-500/10">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
        </div>

        <p className="uppercase tracking-[0.35em] text-xs text-pink-400">
          Finalizing Payment
        </p>

        <h1 className="mt-4 text-4xl font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
          Processing your order
        </h1>

        <p className="mt-4 text-zinc-400 leading-7">
          {message}
        </p>

        <div className="mt-8 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500" />
        </div>
      </div>
    </main>
  )
}
