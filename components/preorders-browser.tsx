"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import ProductCard from "@/components/product-card"
import { getProductPayablePrice, getProductRemainingPrice } from "@/lib/preorder"

type PreOrderProduct = {
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
  depositAmount?: number
  expectedArrival?: string | null
  brand?: {
    name?: string
    logo?: string
  }
}

export default function PreOrdersBrowser({
  products,
}: {
  products: PreOrderProduct[]
}) {
  const SEARCH_KEY = "preorders-search"
  const BRAND_KEY = "preorders-brand"
  const STOCK_KEY = "preorders-stock"
  const SORT_KEY = "preorders-sort"

  const [search, setSearch] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [stockFilter, setStockFilter] = useState("All")
  const [sortBy, setSortBy] = useState("Newest")
  const [prefsReady, setPrefsReady] = useState(false)

  useEffect(() => {
    const savedSearch = sessionStorage.getItem(SEARCH_KEY)
    const savedBrand = sessionStorage.getItem(BRAND_KEY)
    const savedStock = sessionStorage.getItem(STOCK_KEY)
    const savedSort = sessionStorage.getItem(SORT_KEY)

    if (savedSearch !== null) setSearch(savedSearch)
    if (savedBrand !== null) setSelectedBrand(savedBrand)
    if (savedStock !== null) setStockFilter(savedStock)
    if (savedSort !== null) setSortBy(savedSort)
    setPrefsReady(true)
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    sessionStorage.setItem(SEARCH_KEY, search)
    sessionStorage.setItem(BRAND_KEY, selectedBrand)
    sessionStorage.setItem(STOCK_KEY, stockFilter)
    sessionStorage.setItem(SORT_KEY, sortBy)
  }, [prefsReady, search, selectedBrand, stockFilter, sortBy])

  const brandFilters = useMemo(
    () => [
      { name: "All", logo: "" },
      ...Array.from(
        new Map(
          products
            .filter((product) => Boolean(product.brand?.name))
            .map((product): [string, { name: string; logo: string }] => [
              product.brand!.name as string,
              {
                name: product.brand!.name as string,
                logo: product.brand?.logo || "",
              },
            ])
        ).values()
      ),
    ],
    [products]
  )

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()

    return [...products]
      .filter((product) => {
        const availableStock = Math.max(
          0,
          Number(product.stock || 0) -
            Number(product.reservedStock || 0)
        )
        const matchesSearch =
          !term ||
          product.name.toLowerCase().includes(term)
        const matchesBrand =
          selectedBrand === "All"
            ? true
            : product.brand?.name === selectedBrand

        const matchesStock =
          stockFilter === "All"
            ? true
            : stockFilter === "In Stock"
            ? availableStock > 0
            : availableStock === 0

        return (
          matchesSearch &&
          matchesBrand &&
          matchesStock
        )
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
  }, [products, search, selectedBrand, stockFilter, sortBy])

  return (
    <div className="rounded-[2rem] border border-cyan-500/15 bg-white/5 p-4 shadow-[0_0_60px_rgba(34,211,238,.08)] backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Featured pre-orders
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Deposit-first releases with clear balance tracking
          </h2>
        </div>
        <p className="hidden text-sm text-zinc-400 md:block">
          Every card shows deposit, original price, and remaining amount.
        </p>
      </div>

      <div className="mb-10">
        <div className="relative group rounded-2xl shadow-[0_0_30px_rgba(34,211,238,.14)] ring-1 ring-cyan-500/20">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-cyan-400" />
          <input
            type="text"
            placeholder="Search pre-orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-16 w-full rounded-2xl border border-[#2B2B3A] bg-[#15151D] pl-14 pr-5 text-white placeholder:text-gray-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/60 hover:shadow-[0_0_28px_rgba(34,211,238,.18)] focus:border-cyan-400 focus:outline-none focus:shadow-[0_0_42px_rgba(34,211,238,.28)]"
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-3 text-sm font-medium text-cyan-300">Brand</p>
        <div className="flex flex-wrap gap-3">
          {brandFilters.map((brand) => (
            <button
              key={brand.name}
              onClick={() => setSelectedBrand(brand.name)}
              className={`flex min-w-[7rem] items-center justify-center gap-2 rounded-full border px-5 py-2.5 transition-all duration-300 ${
                selectedBrand === brand.name
                  ? "border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  : "border-[#2B2B3A] text-gray-300 hover:border-cyan-400"
              }`}
            >
              {brand.name === "All" ? (
                <span>{brand.name}</span>
              ) : (
                <>
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-6 w-6 rounded-full object-contain"
                    />
                  ) : null}
                  <span>{brand.name}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-3 text-sm font-medium text-cyan-300">Availability</p>
        <div className="flex flex-wrap gap-3">
          {["All", "In Stock", "Sold Out"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStockFilter(filter)}
              className={`rounded-full border px-5 py-2.5 transition-all duration-300 ${
                stockFilter === filter
                  ? "border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  : "border-[#2B2B3A] text-gray-300 hover:border-cyan-400"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-gray-400">
          Showing {filteredProducts.length} Pre-Orders
        </p>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-cyan-300">Sort By</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-12 rounded-xl border border-[#2B2B3A] bg-[#15151D] px-4 text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="Newest">Newest</option>
            <option value="Price Low">Price: Low to High</option>
            <option value="Price High">Price: High to Low</option>
            <option value="Name A-Z">Name: A-Z</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <h2 className="text-2xl font-bold">No Pre-Orders Found</h2>
          <p className="mt-2 text-zinc-400">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))] p-[1px] shadow-[0_0_24px_rgba(34,211,238,.08)] transition-transform duration-300 hover:-translate-y-1"
            >
              <ProductCard
                id={product.id}
                name={product.name}
                price={getProductPayablePrice(product)}
                image={product.images?.[0] || ""}
                description={product.description}
                stock={Math.max(
                  0,
                  Number(product.stock || 0) -
                    Number(product.reservedStock || 0)
                )}
                badge={product.badge}
                quantityPricing={product.quantityPricing}
                isPreOrder={product.isPreOrder}
                depositAmount={product.depositAmount}
                expectedArrival={product.expectedArrival}
                originalPrice={product.price}
                remainingPrice={getProductRemainingPrice(product)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
