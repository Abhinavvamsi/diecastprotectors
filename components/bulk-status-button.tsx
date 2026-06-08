"use client"

export default function BulkStatusButton({
  currentStatus,
  newStatus,
  label,
}: {
  currentStatus: string
  newStatus: string
  label: string
}) {

  async function handleUpdate() {

    const confirmed =
      confirm(
        `Update all ${currentStatus} orders to ${newStatus}?`
      )

    if (!confirmed) return

    await fetch(
      "/api/update-orders-by-status",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          currentStatus,
          newStatus,
        }),
      }
    )

    location.reload()

  }

  return (

    <button
      onClick={handleUpdate}
      className="
      px-6
      py-3
      rounded-xl
      bg-red-500
      hover:bg-red-600
      text-white
      font-bold
      "
    >

      {label}

    </button>

  )

}