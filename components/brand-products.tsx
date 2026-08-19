"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import ProductCard from "@/components/product-card"
import { getProductPayablePrice, getProductRemainingPrice } from "@/lib/preorder"

type Product = {
  id: string
  name: string
  price: number
  images?: string[]
  description: string
  stock: number
  reservedStock?: number
  quantityPricing?: {
    quantity: string
    price: string
  }[]
  badge?: string | null
  isPreOrder?: boolean
  depositAmount?: number
  expectedArrival?: string | null
  preOrderDeadline?: string | null
  brand?: {
    name?: string
  }
}

export default function BrandProducts({
  products,
}: {
  products: Product[]
}) {
  const SEARCH_KEY = "brand-search"
  const STOCK_KEY = "brand-stock"
  const SORT_KEY = "brand-sort"

  const [search, setSearch] = useState("")
  const [stockFilter, setStockFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")
  const [prefsReady, setPrefsReady] = useState(false)

  useEffect(() => {
    const savedSearch = sessionStorage.getItem(SEARCH_KEY)
    const savedStock = sessionStorage.getItem(STOCK_KEY)
    const savedSort = sessionStorage.getItem(SORT_KEY)

    if (savedSearch !== null) setSearch(savedSearch)
    if (savedStock !== null) setStockFilter(savedStock)
    if (savedSort !== null) setSortBy(savedSort)
    setPrefsReady(true)
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    sessionStorage.setItem(SEARCH_KEY, search)
    sessionStorage.setItem(STOCK_KEY, stockFilter)
    sessionStorage.setItem(SORT_KEY, sortBy)
  }, [prefsReady, search, stockFilter, sortBy])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()

    return [...products]
      .filter((product) => {
        const availableStock = Math.max(0, product.stock - (product.reservedStock || 0))
        const matchesSearch =
          !term ||
          product.name.toLowerCase().includes(term)
        const matchesStock =
          stockFilter === "All"
            ? true
            : stockFilter === "In Stock"
            ? availableStock > 0
            : availableStock === 0

        return matchesSearch && matchesStock
      })
      .sort((a, b) => {
        const stockA = Math.max(0, a.stock - (a.reservedStock || 0))
        const stockB = Math.max(0, b.stock - (b.reservedStock || 0))

        if (stockA === 0 && stockB > 0) return 1
        if (stockA > 0 && stockB === 0) return -1

        if (sortBy === "Price Low") {
          return getProductPayablePrice(a) - getProductPayablePrice(b)
        }
        if (sortBy === "Price High") {
          return getProductPayablePrice(b) - getProductPayablePrice(a)
        }
        if (sortBy === "Name A-Z") return a.name.localeCompare(b.name)

        return 0
      })
  }, [products, search, stockFilter, sortBy])

  return (
    <>
      <div className="mb-8">
        <div className="relative group rounded-2xl bg-[linear-gradient(135deg,rgba(236,72,153,0.08),rgba(22,22,30,0.96))] shadow-[0_0_36px_rgba(236,72,153,.2)] ring-1 ring-pink-400/35">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300 transition-colors duration-300 group-focus-within:text-pink-300" />
          <input
            type="text"
            placeholder="Search this brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-16 w-full rounded-2xl border border-pink-400/35 bg-[#171720]/95 pl-14 pr-5 text-white placeholder:text-zinc-300/85 placeholder:uppercase placeholder:tracking-[0.08em] transition-all duration-300 focus:border-pink-300 focus:outline-none focus:shadow-[0_0_46px_rgba(236,72,153,.34)] hover:-translate-y-0.5 hover:border-pink-300/70 hover:bg-[#1A1A24] hover:shadow-[0_0_32px_rgba(236,72,153,.22)]"
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="text-pink-400 text-sm font-medium mb-3">Availability</p>
        <div className="flex flex-wrap gap-3">
          {["All", "In Stock", "Sold Out"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStockFilter(filter)}
              className={`
                px-5 py-2.5 rounded-full border transition-all duration-300
                ${
                  stockFilter === filter
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent"
                    : "border-[#2B2B3A] text-gray-300 hover:border-pink-500"
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <p className="text-gray-400">Showing {filteredProducts.length} Products</p>
        <div className="flex flex-col gap-2">
          <p className="text-pink-400 text-sm font-medium">Sort By</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-12 px-4 rounded-xl border border-[#2B2B3A] bg-[#15151D] text-white focus:border-pink-500 focus:outline-none"
          >
            <option value="Newest">Newest</option>
            <option value="Price Low">Price: Low to High</option>
            <option value="Price High">Price: High to Low</option>
            <option value="Name A-Z">Name: A-Z</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
          <h2 className="text-2xl font-bold">No Products Found</h2>
          <p className="text-zinc-400 mt-2">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={getProductPayablePrice(product)}
              image={product.images?.[0] || ""}
              description={product.description}
              stock={Math.max(0, product.stock - (product.reservedStock || 0))}
              quantityPricing={product.quantityPricing}
              badge={product.badge || undefined}
              isPreOrder={product.isPreOrder}
              depositAmount={product.depositAmount}
              expectedArrival={product.expectedArrival}
              preOrderDeadline={product.preOrderDeadline}
              originalPrice={product.price}
              remainingPrice={getProductRemainingPrice(product)}
            />
          ))}
        </div>
      )}
    </>
  )
}
