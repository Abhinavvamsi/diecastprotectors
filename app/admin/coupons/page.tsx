"use client"
import AdminNav from "@/components/admin-nav"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function CouponsPage() {

  const [coupons, setCoupons] =
    useState<any[]>([])

  const [code, setCode] =
    useState("")

  const [type, setType] =
    useState("PERCENTAGE")

  const [value, setValue] =
    useState("")
  
  const [minOrder, setMinOrder] =
    useState("")

  async function loadCoupons() {

    const response =
      await fetch(
        "/api/admin/coupons"
      )

    const data =
      await response.json()

    setCoupons(data)

  }

  async function createCoupon() {

    const response =
      await fetch(
        "/api/admin/coupons",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

          },

          body:
  JSON.stringify({

    code,

    type,

    value:
      Number(value),

    minOrder:
      Number(minOrder),

  }),
        }
      )

    if (response.ok) {

  setCode("")
  setValue("")
  setMinOrder("")

  toast.success(
    "Coupon created successfully ✅"
  )

  loadCoupons()

}

  }
async function deleteCoupon(
  id: string
) {

  const response =
    await fetch(

      `/api/admin/coupons/${id}`,

      {

        method:
          "DELETE",

      }

    )

  if (response.ok) {

    toast.success(
      "Coupon deleted successfully ✅"
    )

    loadCoupons()

  } else {

    toast.error(
      "Failed to delete coupon"
    )

  }

}
async function toggleCoupon(
  id: string,
  active: boolean
) {

  const response =
    await fetch(

      `/api/admin/coupons/${id}`,

      {

        method:
          "PATCH",

      }

    )

  if (response.ok) {

    toast.success(

      active
        ? "Coupon disabled successfully ✅"
        : "Coupon enabled successfully ✅"

    )

    loadCoupons()

  } else {

    toast.error(
      "Failed to update coupon"
    )

  }

}
  useEffect(() => {

    loadCoupons()

  }, [])

  return (

  <main className="min-h-screen bg-[#09090B] text-white p-8">

    <div className="max-w-7xl mx-auto">

      <AdminNav />

      <div className="mb-12">

        <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
          Shinsei Diecast Admin
        </p>

        <h1 className="text-5xl md:text-6xl font-bold mt-4">
          Coupon Management
        </h1>

        <p className="text-zinc-400 mt-3">
          Create and manage discount coupons.
        </p>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-6">

          <p className="text-zinc-400">
            Total Coupons
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {coupons.length}
          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-6">

          <p className="text-zinc-400">
            Active Coupons
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              coupons.filter(
                c => c.active
              ).length
            }
          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-6">

          <p className="text-zinc-400">
            Total Uses
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {
              coupons.reduce(
                (sum, c) =>
                  sum +
                  ((c.usedBy || []).length),
                0
              )
            }
          </h2>

        </div>

      </div>

      {/* Create Coupon */}

      <div className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-8 mb-10">

        <h2 className="text-2xl font-bold mb-6">
          Create Coupon
        </h2>

        <div className="grid md:grid-cols-5 gap-4">

          <input
            placeholder="WELCOME10"
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value.toUpperCase()
              )
            }
            className="
h-14
rounded-xl
border
border-zinc-700
bg-[#09090B]
px-4
text-white
placeholder:text-zinc-500
outline-none
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
"
          />

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
           className="
h-14
rounded-xl
border
border-zinc-700
bg-[#09090B]
px-4
text-white
placeholder:text-zinc-500
outline-none
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
"
          >

            <option>
              PERCENTAGE
            </option>

            <option>
              FIXED
            </option>

          </select>

          <input
            type="number"
            placeholder="10"
            value={value}
            onChange={(e) =>
              setValue(
                e.target.value
              )
            }
            className="
h-14
rounded-xl
border
border-zinc-700
bg-[#09090B]
px-4
text-white
placeholder:text-zinc-500
outline-none
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
"
          />

          <input
            type="number"
            placeholder="Minimum Order"
            value={minOrder}
            onChange={(e) =>
              setMinOrder(
                e.target.value
              )
            }
            className="
h-14
rounded-xl
border
border-zinc-700
bg-[#09090B]
px-4
text-white
placeholder:text-zinc-500
outline-none
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
"
          />

          <button
            onClick={createCoupon}
            className="
h-14
rounded-xl
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
font-semibold
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
transition-all
duration-300
"
          >

            Create

          </button>

        </div>

      </div>

      {/* Coupons */}

      <div className="grid md:grid-cols-2 gap-6">

        {coupons.map((coupon) => (

          <div
            key={coupon.id}
           className="
bg-zinc-900
border
border-zinc-800
shadow-2xl
rounded-3xl
p-6
hover:border-pink-500/40
hover:shadow-[0_0_25px_rgba(236,72,153,.18)]
transition-all
duration-300
"
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-2xl font-bold">
                  {coupon.code}
                </h2>

                <p className="text-zinc-300 mt-2">

                  {coupon.type === "PERCENTAGE"
                    ? `${coupon.value}% OFF`
                    : `₹${coupon.value} OFF`}

                </p>

                <p className="text-zinc-400 mt-1">

                  Minimum Order:
                  {" "}
                  ₹{coupon.minOrder}

                </p>

              </div>

              <span
                className={`
                px-3
                py-1
                rounded-full
                text-sm
                font-semibold
                ${
                  coupon.active
? "bg-green-500/20 text-green-400 border border-green-500/30"
: "bg-red-500/20 text-red-400 border border-red-500/30"
                }
                `}
              >

                {coupon.active
                  ? "Active"
                  : "Disabled"}

              </span>

            </div>

            <div className="mt-6">

              <p className="text-zinc-400">

                Used By:
                {" "}
                {(coupon.usedBy || []).length}
                {" "}
                Users

              </p>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() =>
                    toggleCoupon(
                      coupon.id,
                      coupon.active
                    )
                  }
                  className="
px-4
py-2
rounded-xl
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
font-semibold
hover:scale-105
hover:shadow-[0_0_20px_rgba(236,72,153,.35)]
transition-all
duration-300
"
                >

                  {coupon.active
                    ? "Disable"
                    : "Enable"}

                </button>

                <button
                  onClick={() =>
                    deleteCoupon(
                      coupon.id
                    )
                  }
                  className="
px-4
py-2
rounded-xl
border
border-red-500
text-red-400
font-semibold
hover:bg-red-500
hover:text-white
transition-all
duration-300
"
                >

                  Delete

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  </main>

)

}