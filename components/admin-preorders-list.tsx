"use client"

import Link from "next/link"
import { formatIndianDisplayDate } from "@/lib/preorder"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
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
  const SEARCH_KEY = "admin-preorders-search"
  const [search, setSearch] = useState("")
  const [prefsReady, setPrefsReady] = useState(false)

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

  return (
    <div className="space-y-5">
      <div className="relative rounded-2xl border border-cyan-500/20 bg-[#111118] shadow-[0_0_30px_rgba(34,211,238,.08)] ring-1 ring-cyan-500/10">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-300/70" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pre-orders by name, brand, or price..."
          className="h-14 w-full rounded-2xl bg-transparent pl-14 pr-5 text-white placeholder:text-zinc-500 outline-none"
        />
      </div>

      <p className="text-sm text-zinc-400">
        Showing {filteredProducts.length} of {products.length} pre-orders
      </p>

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
