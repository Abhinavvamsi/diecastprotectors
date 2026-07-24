"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import ProductCard from "@/components/product-card"

type Product = {
  id: string
  name: string
  price: number
  images?: string[]
  description: string
  stock: number
  reservedStock?: number
  quantityPricing?: any[]
  badge?: string
  isPreOrder?: boolean
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
        const matchesPreOrder =
          !product.isPreOrder
        const matchesStock =
          stockFilter === "All"
            ? true
            : stockFilter === "In Stock"
            ? availableStock > 0
            : availableStock === 0

        return matchesSearch && matchesPreOrder && matchesStock
      })
      .sort((a, b) => {
        const stockA = Math.max(0, a.stock - (a.reservedStock || 0))
        const stockB = Math.max(0, b.stock - (b.reservedStock || 0))

        if (stockA === 0 && stockB > 0) return 1
        if (stockA > 0 && stockB === 0) return -1

        if (sortBy === "Price Low") return a.price - b.price
        if (sortBy === "Price High") return b.price - a.price
        if (sortBy === "Name A-Z") return a.name.localeCompare(b.name)

        return 0
      })
  }, [products, search, stockFilter, sortBy])

  return (
    <>
      <div className="mb-8">
        <div className="relative group rounded-2xl shadow-[0_0_30px_rgba(236,72,153,.14)] ring-1 ring-pink-500/20">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search this brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-16 pl-14 pr-5 rounded-2xl border border-[#2B2B3A] bg-[#15151D] text-white placeholder:text-gray-400 transition-all duration-300 focus:outline-none focus:border-pink-500 focus:shadow-[0_0_42px_rgba(236,72,153,.38)] hover:border-pink-500/60 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(236,72,153,.18)]"
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
              price={product.price}
              image={product.images?.[0] || ""}
              description={product.description}
              stock={Math.max(0, product.stock - (product.reservedStock || 0))}
              quantityPricing={product.quantityPricing}
              badge={product.badge}
            />
          ))}
        </div>
      )}
    </>
  )
}
