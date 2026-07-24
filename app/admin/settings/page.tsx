"use client"

import AdminNav from "@/components/admin-nav"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

const MAX_SUPER_DEALS = 6

type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  reservedStock?: number
}

export default function SettingsPage() {
  const [shippingCharge, setShippingCharge] = useState("0")
  const [shippingMessage, setShippingMessage] = useState("")
  const [pickupEnabled, setPickupEnabled] = useState(false)
  const [pickupLocation, setPickupLocation] = useState("")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [superDealProductIds, setSuperDealProductIds] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [stockFilter, setStockFilter] = useState("All")
  const [prefsReady, setPrefsReady] = useState(false)
  const SEARCH_KEY = "admin-settings-search"
  const STOCK_KEY = "admin-settings-stock"

  const activeSuperDealProductIds = useMemo(() => {
    if (products.length === 0) return []

    return superDealProductIds.filter((productId) => {
      const product = products.find((item) => item.id === productId)
      if (!product) return false

      const availableStock = Math.max(0, product.stock - (product.reservedStock || 0))
      return availableStock > 0
    })
  }, [products, superDealProductIds])

  async function loadSettings() {
    const [settingsResponse, productsResponse] = await Promise.all([
      fetch("/api/admin/settings"),
      fetch("/api/get-products"),
    ])

    const data = await settingsResponse.json()
    const productData = await productsResponse.json()

    setPickupEnabled(data.pickupEnabled || false)
    setPickupLocation(data.pickupLocation || "")
    setShippingCharge(String(data.shippingCharge || 0))
    setShippingMessage(data.shippingMessage || "")
    setMaintenanceMode(data.maintenanceMode || false)
    setSuperDealProductIds(Array.isArray(data.superDealProductIds) ? data.superDealProductIds : [])
    setProducts(productData || [])
  }

  async function saveSettings() {
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shippingCharge: Number(shippingCharge),
        shippingMessage,
        pickupEnabled,
        pickupLocation,
        maintenanceMode,
        superDealProductIds: activeSuperDealProductIds,
      }),
    })

    if (response.ok) {
      toast.success("Settings saved successfully ✅")
    } else {
      toast.error("Failed to save settings")
    }
  }

  useEffect(() => {
    const savedSearch = sessionStorage.getItem(SEARCH_KEY)
    const savedStock = sessionStorage.getItem(STOCK_KEY)
    if (savedSearch !== null) setSearch(savedSearch)
    if (savedStock !== null) setStockFilter(savedStock)
    setPrefsReady(true)
    loadSettings()
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    sessionStorage.setItem(SEARCH_KEY, search)
    sessionStorage.setItem(STOCK_KEY, stockFilter)
  }, [prefsReady, search, stockFilter])

  useEffect(() => {
    if (products.length === 0) return

    if (activeSuperDealProductIds.length !== superDealProductIds.length) {
      setSuperDealProductIds(activeSuperDealProductIds)
    }
  }, [activeSuperDealProductIds, products.length, superDealProductIds.length])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      const availableStock = Math.max(0, product.stock - (product.reservedStock || 0))
      const matchesSearch = product.name.toLowerCase().includes(term)
      const matchesStock =
        stockFilter === "All"
          ? true
          : stockFilter === "In Stock"
          ? availableStock > 0
          : availableStock === 0

      return matchesSearch && matchesStock
    })
  }, [products, search, stockFilter])

  return (
    <main className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNav />

        <div className="mb-12">
          <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
            Shinsei Diecast Admin
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mt-4">Store Settings</h1>
          <p className="text-zinc-400 mt-3">
            Configure shipping, pickup, checkout preferences and homepage super deals.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-8 space-y-8">
          <div>
            <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-3">
              Shipping Charge
            </label>
            <input
              type="number"
              value={shippingCharge}
              onChange={(e) => setShippingCharge(e.target.value)}
              className="w-full h-14 rounded-xl border border-zinc-700 bg-[#09090B] px-4 text-white placeholder:text-zinc-500 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-3">
              Shipping Message
            </label>
            <textarea
              value={shippingMessage}
              onChange={(e) => setShippingMessage(e.target.value)}
              className="w-full min-h-[140px] rounded-xl border border-zinc-700 bg-[#09090B] px-4 py-4 text-white placeholder:text-zinc-500 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <div className="bg-[#09090B] border border-zinc-700 rounded-2xl p-6">
            <label className="flex items-center gap-3 font-medium">
              <input
                type="checkbox"
                checked={pickupEnabled}
                onChange={(e) => setPickupEnabled(e.target.checked)}
                className="w-5 h-5 accent-pink-500"
              />
              Enable Pickup Option
            </label>

            {pickupEnabled && (
              <div className="mt-5">
                <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-3">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full h-14 rounded-xl border border-zinc-700 bg-[#09090B] px-4 text-white placeholder:text-zinc-500 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            )}
          </div>

          <div className="bg-[#09090B] border border-zinc-700 rounded-2xl p-6">
            <p className="text-sm uppercase tracking-wider text-zinc-400">Maintenance Mode</p>
            <p className="mt-1 text-sm text-zinc-500">
              Turn this on to show the maintenance screen to customers while keeping owner and admin access.
            </p>
            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`mt-4 relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${maintenanceMode ? "bg-pink-500" : "bg-zinc-700"}`}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${maintenanceMode ? "translate-x-10" : "translate-x-1"}`}
              />
            </button>
          </div>

          <div className="bg-[#09090B] border border-zinc-700 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wider text-zinc-400">
                  Featured Picks Section
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Pick up to {MAX_SUPER_DEALS} products for the homepage. Out-of-stock picks are replaced automatically.
                </p>
              </div>

              <div className="w-full md:w-80">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-12 rounded-xl border border-zinc-700 bg-[#09090B] px-4 text-white placeholder:text-zinc-500 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>

            {activeSuperDealProductIds.length > 0 && (
              <div className="mt-6 rounded-2xl border border-pink-500/20 bg-pink-500/5 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-wider text-pink-400">
                      Selected Featured Picks
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      These are the products that will show on the homepage Super Deals section.
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {activeSuperDealProductIds.length}/{MAX_SUPER_DEALS} selected
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {activeSuperDealProductIds.map((productId) => {
                    const selectedProduct = products.find((product) => product.id === productId)
                    if (!selectedProduct) return null
                    const availableStock = Math.max(0, selectedProduct.stock - (selectedProduct.reservedStock || 0))

                    return (
                      <div
                        key={productId}
                        className="flex items-center gap-4 rounded-2xl border border-zinc-700 bg-[#111118] p-3"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-black/40">
                          <Image
                            src={selectedProduct.images?.[0] || "/logo.png"}
                            alt={selectedProduct.name}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-[0.25em] text-pink-400">
                            Pick {activeSuperDealProductIds.indexOf(productId) + 1}
                          </p>
                          <h3 className="mt-1 truncate text-sm font-semibold text-white">
                            {selectedProduct.name}
                          </h3>
                          <p className="mt-1 text-xs text-zinc-400">
                            ₹{selectedProduct.price} • {availableStock > 0 ? "In stock" : "Out of stock"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="text-pink-400 text-sm font-medium mb-3">Filter</p>
              <div className="flex flex-wrap gap-3">
                {["All", "In Stock", "Sold Out"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStockFilter(filter)}
                    className={`
                      px-5 py-2.5 rounded-full border transition-all duration-300
                      ${
                        stockFilter === filter
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent"
                          : "border-zinc-700 text-zinc-300 hover:border-pink-500"
                      }
                    `}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[560px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const selected = activeSuperDealProductIds.includes(product.id)
                const availableStock = Math.max(0, product.stock - (product.reservedStock || 0))
                const selectedCount = activeSuperDealProductIds.length

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setSuperDealProductIds((current) => {
                        const currentActiveCount = current.filter((productId) => {
                          const selectedProduct = products.find((item) => item.id === productId)
                          if (!selectedProduct) return false

                          const selectedAvailableStock = Math.max(
                            0,
                            selectedProduct.stock - (selectedProduct.reservedStock || 0),
                          )

                          return selectedAvailableStock > 0
                        }).length

                        if (current.includes(product.id)) {
                          return current.filter((id) => id !== product.id)
                        }

                        if (currentActiveCount >= MAX_SUPER_DEALS) {
                          toast.error(`You can select only ${MAX_SUPER_DEALS} products`)
                          return current
                        }

                        return [...current, product.id]
                      })
                    }}
                    className={`text-left rounded-2xl border transition-all duration-300 overflow-hidden ${selected ? "border-pink-500 bg-pink-500/10 shadow-[0_0_25px_rgba(236,72,153,.25)]" : "border-zinc-700 bg-[#111118] hover:border-pink-500/50"}`}
                  >
                    <div className="relative h-40 bg-[#09090B]">
                      <Image
                        src={product.images?.[0] || "/logo.png"}
                        alt={product.name}
                        fill
                        className="object-contain p-3"
                      />
                      <div className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                        {selected ? "Selected" : "Tap to Pick"}
                      </div>
                      <div className="absolute top-3 right-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-pink-300">
                        {availableStock > 0 ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-pink-400">
                        {product.category}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-white line-clamp-2 min-h-[3rem]">
                        {product.name}
                      </h3>
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <span className="text-xl font-bold text-white">₹{product.price}</span>
                        <span className="text-xs text-zinc-400">{selectedCount}/{MAX_SUPER_DEALS} chosen</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="w-full h-14 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(236,72,153,.35)] transition-all duration-300"
          >
            Save Settings
          </button>
        </div>
      </div>
    </main>
  )
}
