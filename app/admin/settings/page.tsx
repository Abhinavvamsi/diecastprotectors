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

const [maintenanceMode,
  setMaintenanceMode
] = useState(false)

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

      setMaintenanceMode(
        data.maintenanceMode || false
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

maintenanceMode,

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

  <main className="min-h-screen bg-[#09090B] text-white p-8">

    <div className="max-w-7xl mx-auto">

      <AdminNav />

      <div className="mb-12">

        <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
          Shinsei Diecast Admin
        </p>

        <h1 className="text-5xl md:text-6xl font-bold mt-4">
          Store Settings
        </h1>

        <p className="text-zinc-400 mt-3">
          Configure shipping, pickup and checkout preferences.
        </p>

      </div>

      <div
        className="
bg-zinc-900
border
border-zinc-800
shadow-2xl
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
              text-zinc-400
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

          </div>

          {/* Shipping Message */}

          <div>

            <label
              className="
              block
              text-sm
              text-zinc-400
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
border-zinc-700
bg-[#09090B]
px-4
py-4
text-white
placeholder:text-zinc-500
outline-none
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
"
            />

          </div>

          {/* Pickup Settings */}

          <div
            className="
bg-[#09090B]
border
border-zinc-700
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
                accent-pink-500
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
                  text-zinc-400
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
font-bold
text-white
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
hover:scale-[1.02]
hover:shadow-[0_0_30px_rgba(236,72,153,.35)]
transition-all
duration-300
"
          >

            Save Settings

          </button>

          </div>

          {/* Maintenance Mode */}

          <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-black/20 px-4 py-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-zinc-400">
                Maintenance Mode
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                Turn this on to show the maintenance screen to customers while keeping owner and admin access.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMaintenanceMode(!maintenanceMode)
              }
              className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                maintenanceMode
                  ? "bg-pink-500"
                  : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                  maintenanceMode
                    ? "translate-x-10"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

        </div>

    </div>

  </main>

)

}
