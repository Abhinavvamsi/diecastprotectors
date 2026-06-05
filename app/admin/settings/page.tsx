"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {

  const [shippingCharge,
    setShippingCharge
  ] = useState("49")

  const [shippingMessage,
    setShippingMessage
  ] = useState("")

  async function loadSettings() {

    const response =
      await fetch(
        "/api/admin/settings"
      )

    const data =
      await response.json()

    setShippingCharge(
      String(data.shippingCharge)
    )

    setShippingMessage(
      data.shippingMessage || ""
    )

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

            }),

        }
      )

    if (response.ok) {

      toast.success(
        "Settings saved successfully ✅"
      )

    } else {

      toast.error(
        "Failed to save settings"
      )

    }

  }

  useEffect(() => {

    loadSettings()

  }, [])

  return (

    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">

        Store Settings

      </h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

        <div className="space-y-6">

          <div>

            <label className="block mb-2">

              Shipping Charge

            </label>

            <input
              type="number"
              value={shippingCharge}
              onChange={(e) =>
                setShippingCharge(
                  e.target.value
                )
              }
              className="w-full border border-zinc-800 bg-black rounded-xl p-3"
            />

          </div>

          <div>

            <label className="block mb-2">

              Shipping Message

            </label>

            <textarea
              value={shippingMessage}
              onChange={(e) =>
                setShippingMessage(
                  e.target.value
                )
              }
              className="w-full border border-zinc-800 bg-black rounded-xl p-3 min-h-[120px]"
            />

          </div>

          <button
            onClick={
              saveSettings
            }
            className="
            px-6
            py-3
            rounded-xl
            bg-red-500
            hover:bg-red-600
            "
          >

            Save Settings

          </button>

        </div>

      </div>

    </div>

  )

}