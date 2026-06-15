"use client"

import { useRouter } from "next/navigation"

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {

  const router = useRouter()

  async function updateStatus(
    status: string
  ) {

    await fetch(
      "/api/update-order-status",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          orderId,
          status,
        }),
      }
    )

    router.refresh()

  }

  return (

    <select
      value={currentStatus}
      onChange={(e) =>
        updateStatus(
          e.target.value
        )
      }
      className="
      mt-6
      w-full
      md:w-auto
      min-w-[180px]
      h-12
      px-4
      rounded-xl
      bg-white
      text-black
      border
      border-gray-300
      shadow-sm
      outline-none
      cursor-pointer
      focus:border-[#D4AF37]
      focus:ring-2
      focus:ring-[#D4AF37]/20
      transition-all
      "
    >

      <option value="Pending">
        Pending
      </option>

      <option value="Packed">
        Packed
      </option>

      <option value="Shipped">
        Shipped
      </option>

      <option value="Cancelled">
        Cancelled
      </option>

      <option value="Delivered">
        Delivered
      </option>

    </select>

  )

}