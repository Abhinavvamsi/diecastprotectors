"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function MarkPreOrderShippingPaidButton({
  orderId,
  amount,
  mode = "paid",
  label,
  successMessage,
}: {
  orderId: string
  amount: number
  mode?: "paid" | "covered"
  label?: string
  successMessage?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function markPaid() {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch(
        "/api/admin/orders/mark-preorder-shipping-paid",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            mode,
          }),
        }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to mark shipping paid"
        )
      }

      setMessage(
        successMessage ||
          `Marked ₹${data.amountPaid ?? amount} shipping as paid`
      )
      router.refresh()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to mark shipping paid"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={markPaid}
        className="
          rounded-xl
          border
          border-emerald-500/30
          bg-emerald-500/10
          px-4
          py-2
          text-xs
          font-semibold
          uppercase
          tracking-[0.2em]
          text-emerald-200
          transition
          hover:border-emerald-400
          hover:bg-emerald-500/20
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading
          ? "Marking..."
          : label || `Mark Shipping Paid ₹${amount}`}
      </button>
      {message && (
        <span className="text-xs text-zinc-400">
          {message}
        </span>
      )}
    </div>
  )
}
