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

  <main className="min-h-screen bg-white text-black p-8">

    <div className="max-w-7xl mx-auto">

      <AdminNav />

      <div className="mb-12">

        <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm">
          Diecast Universe Admin
        </p>

        <h1 className="text-5xl md:text-6xl font-bold mt-4">
          Store Settings
        </h1>

        <p className="text-gray-500 mt-3">
          Configure shipping, pickup and checkout preferences.
        </p>

      </div>

      <div
        className="
        bg-white
        border
        border-gray-200
        shadow-sm
        rounded-3xl
        p-8
        "
      >

        <div className="space-y-8">

          {/* Shipping Charge */}

          <div>

            <label
              className="
              block
              text-sm
              text-gray-500
              uppercase
              tracking-wider
              mb-3
              "
            >
              Shipping Charge
            </label>

            <input
              type="number"
              placeholder="Shipping Charge"
              value={shippingCharge}
              onChange={(e) =>
                setShippingCharge(
                  e.target.value
                )
              }
              className="
              w-full
              h-14
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              text-black
              outline-none
              focus:border-[#D4AF37]
              focus:ring-2
              focus:ring-[#D4AF37]/20
              "
            />

          </div>

          {/* Shipping Message */}

          <div>

            <label
              className="
              block
              text-sm
              text-gray-500
              uppercase
              tracking-wider
              mb-3
              "
            >
              Shipping Message
            </label>

            <textarea
              placeholder="Shipping Message"
              value={shippingMessage}
              onChange={(e) =>
                setShippingMessage(
                  e.target.value
                )
              }
              className="
              w-full
              min-h-[140px]
              rounded-xl
              border
              border-gray-300
              bg-white
              px-4
              py-4
              text-black
              outline-none
              focus:border-[#D4AF37]
              focus:ring-2
              focus:ring-[#D4AF37]/20
              "
            />

          </div>

          {/* Pickup Settings */}

          <div
            className="
            bg-gray-50
            border
            border-gray-200
            rounded-2xl
            p-6
            "
          >

            <label
              className="
              flex
              items-center
              gap-3
              font-medium
              "
            >

              <input
                type="checkbox"
                checked={pickupEnabled}
                onChange={(e) =>
                  setPickupEnabled(
                    e.target.checked
                  )
                }
                className="
                w-5
                h-5
                accent-[#D4AF37]
                "
              />

              Enable Pickup Option

            </label>

            {pickupEnabled && (

              <div className="mt-5">

                <label
                  className="
                  block
                  text-sm
                  text-gray-500
                  uppercase
                  tracking-wider
                  mb-3
                  "
                >
                  Pickup Location
                </label>

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
                  h-14
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4
                  text-black
                  outline-none
                  focus:border-[#D4AF37]
                  focus:ring-2
                  focus:ring-[#D4AF37]/20
                  "
                />

              </div>

            )}

          </div>

          {/* Save Button */}

          <button
            onClick={saveSettings}
            className="
            w-full
            h-14
            rounded-xl
            bg-[#D4AF37]
            text-black
            font-bold
            hover:bg-[#B8941F]
            transition-all
            "
          >

            Save Settings

          </button>

        </div>

      </div>

    </div>

  </main>

)

}