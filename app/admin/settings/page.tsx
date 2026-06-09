"use client"
import AdminNav from "@/components/admin-nav"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {

  const [shippingCharge,
    setShippingCharge
  ] = useState("0")

  const [shippingMessage,
    setShippingMessage
  ] = useState("")

  const [pickupEnabled,
  setPickupEnabled
] = useState(false)

const [pickupLocation,
  setPickupLocation
] = useState("")

  async function loadSettings() {

    const response =
      await fetch(
        "/api/admin/settings"
      )

    const data =
      await response.json()

    if (data) {
      setPickupEnabled(
  data.pickupEnabled || false
)

setPickupLocation(
  data.pickupLocation || ""
)

      setShippingCharge(
        String(data.shippingCharge)
      )

      setShippingMessage(
        data.shippingMessage || ""
      )

    }

  }

  async function saveSettings() {

    const response =
      await fetch(
        "/api/admin/settings",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({

              shippingCharge:
                Number(
                  shippingCharge
                ),

              shippingMessage,
              pickupEnabled,

pickupLocation,

            }),

        }
      )

    if (response.ok) {

      toast.success(
        "Settings saved successfully ✅"
      )

    }

  }

  useEffect(() => {

    loadSettings()

  }, [])

  return (

    <div className="max-w-7xl mx-auto">
    
      <AdminNav />
    
      <h1 className="text-5xl font-bold mb-12">
    
        Store Settings
    
      </h1>

      <div className="space-y-6">

        <input
          type="number"
          placeholder="Shipping Charge"
          value={shippingCharge}
          onChange={(e) =>
            setShippingCharge(
              e.target.value
            )
          }
          className="w-full border rounded-xl p-3"
        />

        <textarea
          placeholder="Shipping Message"
          value={shippingMessage}
          onChange={(e) =>
            setShippingMessage(
              e.target.value
            )
          }
          className="w-full border rounded-xl p-3 min-h-[120px]"
        />
<div className="space-y-4">

  <label className="flex items-center gap-3">

    <input
      type="checkbox"
      checked={pickupEnabled}
      onChange={(e) =>
        setPickupEnabled(
          e.target.checked
        )
      }
    />

    <span>
      Enable Pickup Option
    </span>

  </label>

  {pickupEnabled && (

    <input
      type="text"
      placeholder="Pickup Location"
      value={pickupLocation}
      onChange={(e) =>
        setPickupLocation(
          e.target.value
        )
      }
      className="
      w-full
      border
      rounded-xl
      p-3
      "
    />

  )}

</div>
        <button
          onClick={saveSettings}
          className="
          bg-red-500
          text-white
          px-6
          py-3
          rounded-xl
          "
        >

          Save Settings

        </button>

      </div>

    </div>

  )

}