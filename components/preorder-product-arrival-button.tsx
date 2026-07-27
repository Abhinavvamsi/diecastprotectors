"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PreOrderProductArrivalButton({
  productId,
  arrivedCount,
}: {
  productId: string
  arrivedCount: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const isArrived = arrivedCount > 0

  async function updateArrival() {
    setLoading(true)
    setResult("")

    try {
      const response = await fetch(
        "/api/admin/pre-orders/mark-arrived",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            arrived: !isArrived,
          }),
        }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to mark arrived"
        )
      }

      setResult(
        data.updatedOrders > 0
          ? `${data.arrived ? "Unlocked" : "Locked"} ${data.updatedOrders} order${data.updatedOrders === 1 ? "" : "s"}`
          : data.lockedItems > 0
          ? "Some items already have paid balances"
          : "No orders to update"
      )
      router.refresh()
    } catch (error) {
      setResult(
        error instanceof Error
          ? error.message
          : "Failed to mark arrived"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={updateArrival}
        className={`
        rounded-2xl
        border
        ${isArrived ? "border-orange-500/30 bg-orange-500/10 text-orange-200 hover:border-orange-400" : "border-green-500/30 bg-green-500/10 text-green-200 hover:border-green-400"}
        px-5
        py-3
        font-semibold
        transition
        hover:scale-105
        disabled:cursor-not-allowed
        disabled:opacity-60
        `}
      >
        {loading
          ? "Updating Orders..."
          : isArrived
          ? "Undo Arrival"
          : "Mark Arrived"}
      </button>
      {result && (
        <span className="text-xs text-zinc-400">
          {result}
        </span>
      )}
    </div>
  )
}
