"use client"

import { useState } from "react"

import Navbar from "@/components/navbar"

import { toast } from "sonner"

type Order = {

  orderId: string

  customer: string

  totalAmount: number

  paymentId: string

  status: string

  createdAt: string

}

export default function TrackOrderPage() {

  const [orderId,
    setOrderId
  ] = useState("")

  const [order,
    setOrder
  ] = useState<Order | null>(null)

  const [loading,
    setLoading
  ] = useState(false)

  async function handleTrackOrder() {

    try {

      setLoading(true)

      const response = await fetch(
        `/api/track-order?orderId=${orderId}`
      )

      if (!response.ok) {

        toast.error(
          "Order not found"
        )

        return

      }

      const data =
        await response.json()

      setOrder(data)

    } catch (error) {

      toast.error(
        "Order not found"
      )

    } finally {

      setLoading(false)

    }

  }

  return (

    <main className="min-h-screen bg-black text-white">

      {/* Global Navbar */}
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Heading */}
        <div className="mb-12">

          <h1 className="text-5xl font-bold">

            Track Your Order

          </h1>

          <p className="text-red-500 mt-4 text-lg">

            Enter your Order ID to check your latest order status.

          </p>

        </div>

        {/* Search Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

          <label className="block text-zinc-400 mb-4">

            Order ID

          </label>

          <input
            type="text"
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) =>
              setOrderId(
                e.target.value
              )
            }
            className="w-full h-14 rounded-xl bg-black border border-zinc-800 px-4 outline-none focus:border-white transition"
          />

          <button
            onClick={
              handleTrackOrder
            }
            disabled={
              loading ||
              !orderId
            }
            className="w-full mt-6 h-14 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
          >

            {loading
              ? "Tracking..."
              : "Track Order"}

          </button>

        </div>

        {/* Order Details */}
        {order && (

          <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>

                <h2 className="text-3xl font-bold">

                  {order.customer}

                </h2>

                <p className="text-zinc-400 mt-4">

                  Order ID:
                  <br />

                  {order.orderId}

                </p>

                <p className="text-zinc-400 mt-4 break-all">

                  Payment ID:
                  <br />

                  {order.paymentId}

                </p>

                <p className="text-zinc-400 mt-4">

                  Ordered On:
                  <br />

                  {new Date(
  order.createdAt
).toLocaleString(
  "en-IN",
  {
    timeZone:
      "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
)}

                </p>

              </div>

              <div>

                <p className="text-red-500">

                  Total Amount

                </p>

                <p className="text-4xl font-bold mt-2">

                  ₹{order.totalAmount}

                </p>

              </div>

            </div>

            {/* Status Timeline */}
            <div className="mt-12 space-y-6">

              {/* Pending */}
              <div className="flex items-center gap-4">

                <div
                  className={`w-5 h-5 rounded-full ${
                    [
                      "Pending",
                      "Packed",
                      "Shipped",
                      "Delivered",
                    ].includes(
                      order.status
                    )
                      ? "bg-green-500"
                      : "bg-zinc-700"
                  }`}
                />

                <p className="text-lg">

                  Pending

                </p>

              </div>

              {/* Packed */}
              <div className="flex items-center gap-4">

                <div
                  className={`w-5 h-5 rounded-full ${
                    [
                      "Packed",
                      "Shipped",
                      "Delivered",
                    ].includes(
                      order.status
                    )
                      ? "bg-green-500"
                      : "bg-zinc-700"
                  }`}
                />

                <p className="text-lg">

                  Packed

                </p>

              </div>

              {/* Shipped */}
              <div className="flex items-center gap-4">

                <div
                  className={`w-5 h-5 rounded-full ${
                    [
                      "Shipped",
                      "Delivered",
                    ].includes(
                      order.status
                    )
                      ? "bg-green-500"
                      : "bg-zinc-700"
                  }`}
                />

                <p className="text-lg">

                  Shipped

                </p>

              </div>

              {/* Delivered */}
              <div className="flex items-center gap-4">

                <div
                  className={`w-5 h-5 rounded-full ${
                    order.status ===
                    "Delivered"
                      ? "bg-green-500"
                      : "bg-zinc-700"
                  }`}
                />

                <p className="text-lg">

                  Delivered

                </p>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>

  )

}