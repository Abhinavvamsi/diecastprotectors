"use client"

import Link from "next/link"
import { formatIndianDisplayDate } from "@/lib/preorder"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import PreOrderProductArrivalButton from "@/components/preorder-product-arrival-button"

type PreOrderProduct = {
  id: string
  name: string
  price: number
  images?: string[]
  stock: number
  reservedStock?: number
  depositAmount?: number
	  expectedArrival?: string | null
	  preOrderDeadline?: string | null
	  arrivedOrderCount?: number
  brand?: {
    name?: string
  }
}

export default function AdminPreOrdersList({
  products,
}: {
  products: PreOrderProduct[]
}) {
  const router = useRouter()
  const SEARCH_KEY = "admin-preorders-search"
  const [search, setSearch] = useState("")
  const [prefsReady, setPrefsReady] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [bulkMarking, setBulkMarking] = useState(false)

  useEffect(() => {
    const savedSearch = sessionStorage.getItem(SEARCH_KEY)
    if (savedSearch !== null) {
      setSearch(savedSearch)
    }
    setPrefsReady(true)
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    sessionStorage.setItem(SEARCH_KEY, search)
  }, [prefsReady, search])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()

    return products.filter((product) => {
      if (!term) return true

      return (
        product.name.toLowerCase().includes(term) ||
        product.brand?.name?.toLowerCase().includes(term) ||
        String(product.price).includes(term)
      )
    })
  }, [products, search])

  const visibleProductIds = useMemo(
    () => filteredProducts.map((product) => product.id),
    [filteredProducts]
  )

  const selectedVisibleCount =
    selectedProductIds.filter((id) => visibleProductIds.includes(id)).length

  const allVisibleSelected =
    visibleProductIds.length > 0 &&
    selectedVisibleCount === visibleProductIds.length

  useEffect(() => {
    const validProductIds = new Set(products.map((product) => product.id))

    setSelectedProductIds((currentIds) =>
      currentIds.filter((id) => validProductIds.has(id))
    )
  }, [products])

  function toggleProductSelection(productId: string) {
    setSelectedProductIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((id) => id !== productId)
        : [...currentIds, productId]
    )
  }

  function toggleVisibleSelection() {
    setSelectedProductIds((currentIds) => {
      if (allVisibleSelected) {
        return currentIds.filter(
          (id) => !visibleProductIds.includes(id)
        )
      }

      return Array.from(
        new Set([...currentIds, ...visibleProductIds])
      )
    })
  }

  async function markSelectedAsArrived() {
    if (selectedProductIds.length === 0 || bulkMarking) return

    setBulkMarking(true)

    try {
      const response = await fetch(
        "/api/admin/pre-orders/mark-arrived",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productIds: selectedProductIds,
            arrived: true,
          }),
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to mark selected pre-orders as arrived"
        )
      }

      toast.success(
        `Marked ${data?.updatedItems ?? selectedProductIds.length} pre-order item${
          (data?.updatedItems ?? selectedProductIds.length) === 1
            ? ""
            : "s"
        } as arrived`
      )
      setSelectedProductIds([])
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark selected pre-orders"
      )
    } finally {
      setBulkMarking(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="relative rounded-2xl border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(17,17,24,0.96))] shadow-[0_0_34px_rgba(34,211,238,.14)] ring-1 ring-cyan-400/20">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-100/90" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pre-orders by name, brand, or price..."
          className="h-14 w-full rounded-2xl bg-transparent pl-14 pr-5 text-white placeholder:text-cyan-50/78 placeholder:uppercase placeholder:tracking-[0.06em] outline-none"
        />
      </div>

      <p className="text-sm text-zinc-400">
        Showing {filteredProducts.length} of {products.length} pre-orders
      </p>

      {filteredProducts.length > 0 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-4 shadow-[0_0_24px_rgba(34,211,238,.08)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
              Bulk Arrival Tools
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">
              Select any pre-orders, then mark matching customer items as arrived.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleVisibleSelection}
              className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-bold uppercase tracking-wider text-cyan-100 transition hover:scale-105 hover:border-cyan-300"
            >
              {allVisibleSelected ? "Clear Visible" : "Select Visible"}
            </button>
            <button
              type="button"
              onClick={() => setSelectedProductIds([])}
              disabled={selectedProductIds.length === 0 || bulkMarking}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-bold uppercase tracking-wider text-zinc-300 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={markSelectedAsArrived}
              disabled={selectedProductIds.length === 0 || bulkMarking}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_24px_rgba(34,211,238,.2)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {bulkMarking
                ? "Marking..."
                : `Mark Arrived (${selectedProductIds.length})`}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <h2 className="text-2xl font-bold">No Pre-Order Products</h2>
            <p className="mt-3 text-zinc-400">
              Try a different search term.
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const availableStock = Math.max(
              0,
              Number(product.stock || 0) -
                Number(product.reservedStock || 0)
            )
            const remaining = Math.max(
              0,
              Number(product.price || 0) -
                Math.floor(
                  Number(product.price || 0) *
                    Number(product.depositAmount || 50) /
                    100
                )
            )

            return (
              <div
                key={product.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-zinc-700 bg-black/40 shadow-[0_0_24px_rgba(34,211,238,.08)]">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="112px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-zinc-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{product.name}</h2>
                      <p className="mt-2 text-zinc-400">
                        Original: ₹{Number(product.price || 0)} • Deposit: {Number(product.depositAmount || 50)}% • Remaining: ₹{remaining}
                      </p>
                      <p className="mt-1 text-zinc-400">
                        Available stock: {availableStock} • Reserved: {Number(product.reservedStock || 0)} • Total: {Number(product.stock || 0)}
                      </p>
	                      {product.expectedArrival && (
	                        <p className="mt-1 text-zinc-400">
	                          Expected arrival: {product.expectedArrival}
	                        </p>
	                      )}
	                      {product.preOrderDeadline && (
	                        <p className="mt-1 text-orange-300">
	                          Accepting until: {formatIndianDisplayDate(product.preOrderDeadline)}
	                        </p>
	                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => toggleProductSelection(product.id)}
                      className={`rounded-2xl px-5 py-3 font-semibold transition hover:scale-105 ${
                        selectedProductIds.includes(product.id)
                          ? "border border-cyan-300 bg-cyan-400 text-black shadow-[0_0_22px_rgba(34,211,238,.25)]"
                          : "border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-cyan-500/60"
                      }`}
                    >
                      {selectedProductIds.includes(product.id)
                        ? "Selected"
                        : "Select"}
                    </button>
                    <PreOrderProductArrivalButton
                      productId={product.id}
                      arrivedCount={product.arrivedOrderCount || 0}
                    />
                    <Link
                      href={`/admin/orders?productId=${product.id}`}
                      className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 font-semibold text-cyan-100 transition hover:scale-105 hover:border-cyan-400"
                    >
                      View Orders
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-5 py-3 font-semibold text-white transition hover:scale-105"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
