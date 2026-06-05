"use client"

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

    <div className="p-8 max-w-6xl mx-auto">

      <h1 className="text-3xl font-bold mb-8">

        Coupon Management

      </h1>
      <div className="grid md:grid-cols-3 gap-6 mb-10">

  <div className="bg-zinc-900 rounded-3xl p-6">
    <p className="text-zinc-500">
      Total Coupons
    </p>

    <h2 className="text-3xl font-bold">
      {coupons.length}
    </h2>
  </div>

  <div className="bg-zinc-900 rounded-3xl p-6">
    <p className="text-zinc-500">
      Active Coupons
    </p>

    <h2 className="text-3xl font-bold">
      {
        coupons.filter(
          c => c.active
        ).length
      }
    </h2>
  </div>

  <div className="bg-zinc-900 rounded-3xl p-6">
    <p className="text-zinc-500">
      Total Uses
    </p>

    <h2 className="text-3xl font-bold">
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

      <div className="border rounded-xl p-6 mb-10">

        <h2 className="font-bold mb-4">

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
            className="border rounded p-3"
          />

          <select
  value={type}
  onChange={(e) =>
    setType(e.target.value)
  }
  className="
    border
    border-zinc-800
    rounded-xl
    p-3
    bg-black
    text-white
    focus:outline-none
    focus:border-red-500
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
            className="border rounded p-3"
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
  className="border rounded p-3"
/>
          <button
            onClick={
              createCoupon
            }
            className="
            bg-black
            text-white
            rounded
            px-4
            "
          >

            Create

          </button>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6">

  {coupons.map(
    (coupon) => (

      <div
        key={coupon.id}
        className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-3xl
        p-6
        "
      >

        <div className="flex justify-between">

          <div>

            <h2 className="text-2xl font-bold">
              {coupon.code}
            </h2>

            <p className="text-zinc-400 mt-2">

              {coupon.type === "PERCENTAGE"
                ? `${coupon.value}% OFF`
                : `₹${coupon.value} OFF`}

            </p>

            <p className="text-zinc-500 mt-1">

  Minimum Order:

  ₹{coupon.minOrder}

</p>

          </div>

          <div>

            {coupon.active
              ? "🟢 Active"
              : "🔴 Disabled"}

          </div>

        </div>

        <div className="mt-6">

  <p className="text-zinc-500">

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
      bg-yellow-600
      hover:bg-yellow-500
      transition
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
      bg-red-600
      hover:bg-red-500
      transition
      "
    >

      Delete

    </button>

  </div>

</div>     

</div>

    )
  )}

</div>

    </div>

  )

}