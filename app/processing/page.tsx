"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useCartStore } from "@/store/cart-store"

const pendingOrderStorageKey = "pending-order"
const pendingOrderBackupStorageKey =
  "pending-order-backup"
const confirmedOrderStorageKey =
  "confirmed-order-after-payment"
const confirmedOrderMaxAgeMs = 30 * 60 * 1000

type SaveOrderResponse = {
  orderId?: string
  error?: string
}

async function readApiJson<T = unknown>(
  response: Response,
  fallbackMessage = "Failed to save order"
): Promise<T & { error?: string }> {
  const text = await response.text()

  if (!text.trim()) {
    return {} as T & { error?: string }
  }

  try {
    return JSON.parse(text)
  } catch {
    return {
      error: fallbackMessage,
    } as T & { error?: string }
  }
}

export default function ProcessingPage() {
  const router = useRouter()
  const [message, setMessage] = useState(
    "Your payment is confirmed. We are saving your order now."
  )

  useEffect(() => {
    router.prefetch("/success")

    let cancelled = false

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    function safeGetItem(
      storage: Storage,
      key: string
    ) {
      try {
        return storage.getItem(key)
      } catch {
        return null
      }
    }

    function safeSetItem(
      storage: Storage,
      key: string,
      value: string
    ) {
      try {
        storage.setItem(key, value)
      } catch {
        return
      }
    }

    function safeRemoveItem(
      storage: Storage,
      key: string
    ) {
      try {
        storage.removeItem(key)
      } catch {
        return
      }
    }

    function readPendingOrder() {
      const rawPendingOrder =
        safeGetItem(sessionStorage, pendingOrderStorageKey) ||
        safeGetItem(localStorage, pendingOrderBackupStorageKey)

      if (!rawPendingOrder) return null

      try {
        return JSON.parse(rawPendingOrder)
      } catch {
        safeRemoveItem(sessionStorage, pendingOrderStorageKey)
        safeRemoveItem(
          localStorage,
          pendingOrderBackupStorageKey
        )
        return null
      }
    }

    function readRecentConfirmedOrderId() {
      const rawConfirmedOrder =
        safeGetItem(sessionStorage, confirmedOrderStorageKey) ||
        safeGetItem(localStorage, confirmedOrderStorageKey)

      if (!rawConfirmedOrder) return null

      try {
        const confirmedOrder = JSON.parse(rawConfirmedOrder)
        const savedAt = Number(confirmedOrder.savedAt || 0)
        const orderId =
          typeof confirmedOrder.orderId === "string"
            ? confirmedOrder.orderId
            : ""

        if (
          orderId &&
          Date.now() - savedAt <= confirmedOrderMaxAgeMs
        ) {
          return orderId
        }
      } catch {
        if (rawConfirmedOrder.startsWith("HWS-")) {
          return rawConfirmedOrder
        }
      }

      safeRemoveItem(sessionStorage, confirmedOrderStorageKey)
      safeRemoveItem(localStorage, confirmedOrderStorageKey)
      return null
    }

    function rememberConfirmedOrder(orderId: string) {
      const payload = JSON.stringify({
        orderId,
        savedAt: Date.now(),
      })

      safeSetItem(
        sessionStorage,
        confirmedOrderStorageKey,
        payload
      )
      safeSetItem(
        localStorage,
        confirmedOrderStorageKey,
        payload
      )
    }

    async function savePendingOrder() {
      const pendingOrder = readPendingOrder()

      if (!pendingOrder) {
        const confirmedOrderId =
          readRecentConfirmedOrderId()

        if (confirmedOrderId) {
          setMessage(
            "Order already confirmed. Opening your success page..."
          )
          router.replace(
            `/success?orderId=${encodeURIComponent(
              confirmedOrderId
            )}`
          )
          return
        }

        setMessage(
          "Payment details are not available on this device. If money was deducted, please contact support with your Razorpay payment ID."
        )
        return
      }

      const maxAttempts = 10

      for (
        let attempt = 1;
        attempt <= maxAttempts;
        attempt += 1
      ) {
        try {
          setMessage(
            attempt === 1
              ? "Saving your order now..."
              : `Saving your order now... attempt ${attempt}/${maxAttempts}`
          )

          const saveOrderResponse = await fetch(
            "/api/save-order",
            {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(pendingOrder),
          }
          )

          const savedOrder = await readApiJson<SaveOrderResponse>(
            saveOrderResponse,
            "Failed to save order"
          )

          if (
            !saveOrderResponse.ok ||
            !savedOrder.orderId
          ) {
            throw new Error(
              savedOrder.error || "Failed to save order"
            )
          }

          rememberConfirmedOrder(savedOrder.orderId)
          safeRemoveItem(sessionStorage, pendingOrderStorageKey)
          safeRemoveItem(
            localStorage,
            pendingOrderBackupStorageKey
          )
          useCartStore.getState().clearCart()

          if (!cancelled) {
            setMessage(
              "Order confirmed. Opening your success page..."
            )

            router.replace(
              `/success?orderId=${encodeURIComponent(
                savedOrder.orderId
              )}`
            )
          }
          return
        } catch (error) {
          if (cancelled) return

          if (attempt < maxAttempts) {
            await sleep(
              Math.min(10000, 1200 * attempt)
            )
            continue
          }

          setMessage(
            "Payment is captured, but the order is still syncing. Please keep this page open and contact support if it does not confirm shortly."
          )
          return
        }
      }
    }

    void savePendingOrder()

    return () => {
      cancelled = true
    }
  }, [router])

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
