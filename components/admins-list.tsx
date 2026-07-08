"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AdminsList({
  initialAdmins,
}: {
  initialAdmins: any[]
}) {

  const [admins] =
    useState(initialAdmins)

  const router =
    useRouter()

  const [email, setEmail] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  async function addAdmin() {

    if (!email) {

      toast.error("Enter email")

      return

    }

    try {

      setLoading(true)

      const response =
        await fetch(
          "/api/admin/admins",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
            }),

          }
        )

      const data =
        await response.json()

      if (!response.ok) {

        toast.error(data.error)

        return

      }

      toast.success(
        "Admin added successfully"
      )

      setEmail("")

      window.location.reload()

    } finally {

      setLoading(false)

    }

  }

  return (

    <>

      {/* Add Admin */}

      <div
        className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
        mb-8
        "
      >

        <h2 className="text-2xl font-bold mb-6">

          Add New Admin

        </h2>

        <div className="grid md:grid-cols-[1fr_auto] gap-4">

          <input
            type="email"
            placeholder="Enter user's email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="
            h-14
            rounded-xl
            bg-zinc-950
            border
            border-zinc-700
            px-4
            text-white
            outline-none
            focus:border-pink-500
            "
          />

          <button
            onClick={addAdmin}
            disabled={loading}
            className="
            h-14
            px-8
            rounded-xl
            bg-gradient-to-r
            from-pink-500
            via-fuchsia-500
            to-purple-600
            text-white
            font-semibold
            hover:scale-105
            transition-all
            disabled:opacity-60
            "
          >

            {loading
              ? "Adding..."
              : "Add Admin"}

          </button>

        </div>

      </div>

      {/* Admin List */}

      <div className="space-y-6">

        {admins.map((admin) => (

          <div
            key={admin.id}
            className="
            bg-zinc-900
            border
            border-zinc-800
            rounded-3xl
            p-6
            flex
            justify-between
            items-center
            "
          >

            <div
  key={admin.id}
  className="
  bg-zinc-900
  border
  border-zinc-800
  rounded-3xl
  p-6
  flex
  flex-col
  md:flex-row
  md:items-center
  md:justify-between
  gap-6
  "
>

  <div>

    <h2 className="text-xl font-bold">
      {admin.email}
    </h2>

    <p className="text-zinc-400 mt-2">
      Role: {admin.role}
    </p>

    <p
      className={
        admin.active
          ? "text-green-400 mt-2"
          : "text-red-400 mt-2"
      }
    >
      {admin.active
        ? "Active"
        : "Disabled"}
    </p>

  </div>

 {admin.role === "OWNER" ? (

  <div
    className="
    px-5
    h-12
    rounded-xl
    bg-gradient-to-r
    from-yellow-500
    to-amber-600
    text-black
    font-bold
    flex
    items-center
    justify-center
    "
  >
    👑 OWNER (Protected)
  </div>

) : (

  <div className="flex gap-3">

    {/* Enable / Disable */}

    <button
      onClick={async () => {

        const response =
          await fetch(
            `/api/admin/admins/${admin.id}`,
            {
              method: "PATCH",
            }
          )

        const data =
          await response.json()

        if (!response.ok) {

          toast.error(data.error)

          return

        }

        toast.success(
          admin.active
            ? "Admin disabled"
            : "Admin enabled"
        )

        window.location.reload()

      }}
      className={`
      h-12
      px-6
      rounded-xl
      font-semibold
      transition-all

      ${
        admin.active
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-green-500 hover:bg-green-600 text-white"
      }
      `}
    >

      {admin.active
        ? "Disable"
        : "Enable"}

    </button>

    {/* Delete */}

    <button
      onClick={async () => {

        if (
          !window.confirm(
            `Delete ${admin.email}?`
          )
        ) return

        const response =
          await fetch(
            `/api/admin/admins/${admin.id}`,
            {
              method: "DELETE",
            }
          )

        const data =
          await response.json()

        if (!response.ok) {

          toast.error(data.error)

          return

        }

        toast.success(
          "Admin deleted"
        )

        window.location.reload()

      }}
      className="
      h-12
      px-6
      rounded-xl
      bg-zinc-800
      border
      border-zinc-700
      text-white
      hover:bg-red-500
      hover:border-red-500
      transition-all
      "
    >

      Delete

    </button>

  </div>

)}

</div>

          </div>

        ))}

      </div>

    </>

  )

}