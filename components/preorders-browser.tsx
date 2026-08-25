"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import ProductCard from "@/components/product-card"
import { getProductPayablePrice, getProductRemainingPrice } from "@/lib/preorder"

const INITIAL_PREORDER_RENDER_COUNT = 18
const LOAD_MORE_PREORDER_COUNT = 18

type PreOrderProduct = {
  id: string
  name: string
  price: number
  createdAt?: string | Date
  images?: string[]
  description: string
  stock: number
  reservedStock?: number
  quantityPricing?: {
    quantity: string
    price: string
    saleOriginalPrice?: number | string | null
  }[]
  badge?: string | null
  isPreOrder?: boolean
  depositAmount?: number
  expectedArrival?: string | null
  preOrderDeadline?: string | null
  saleOriginalPrice?: number | null
  siteDiscountPercent?: number | null
  brand?: {
    name?: string | null
    logo?: string | null
  } | null
}

export default function PreOrdersBrowser({
  products,
  featuredProductIds = [],
}: {
  products: PreOrderProduct[]
  featuredProductIds?: string[]
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
  const [visibleCount, setVisibleCount] = useState(
    INITIAL_PREORDER_RENDER_COUNT
  )
  const featuredRank = useMemo(
    () =>
      new Map(
        featuredProductIds.map((productId, index) => [
          productId,
          index,
        ])
      ),
    [featuredProductIds]
  )

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
    const getCreatedAtTime = (product: PreOrderProduct) => {
      if (!product.createdAt) return 0

      const value =
        product.createdAt instanceof Date
          ? product.createdAt
          : new Date(product.createdAt)

      return value.getTime()
    }

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

        const rankA = featuredRank.get(a.id) ?? Number.POSITIVE_INFINITY
        const rankB = featuredRank.get(b.id) ?? Number.POSITIVE_INFINITY
        const featuredOrder = rankA === rankB ? 0 : rankA - rankB

        if (sortBy === "Price Low") {
          const priceOrder =
            getProductPayablePrice(a) - getProductPayablePrice(b)

          if (priceOrder !== 0) return priceOrder
          if (featuredOrder !== 0) return featuredOrder
          return a.name.localeCompare(b.name)
        }
        if (sortBy === "Price High") {
          const priceOrder =
            getProductPayablePrice(b) - getProductPayablePrice(a)

          if (priceOrder !== 0) return priceOrder
          if (featuredOrder !== 0) return featuredOrder
          return a.name.localeCompare(b.name)
        }
        if (sortBy === "Name A-Z") {
          const nameOrder = a.name.localeCompare(b.name)

          if (nameOrder !== 0) return nameOrder
          if (featuredOrder !== 0) return featuredOrder
          return 0
        }

        if (featuredOrder !== 0) return featuredOrder

        return getCreatedAtTime(b) - getCreatedAtTime(a)
      })
  }, [products, search, selectedBrand, stockFilter, sortBy, featuredRank])

  useEffect(() => {
    setVisibleCount(INITIAL_PREORDER_RENDER_COUNT)
  }, [search, selectedBrand, stockFilter, sortBy])

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
        <div className="relative group rounded-2xl bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(22,22,30,0.96))] shadow-[0_0_36px_rgba(34,211,238,.18)] ring-1 ring-cyan-400/35">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-200 transition-colors duration-300 group-focus-within:text-cyan-200" />
          <input
            type="text"
            placeholder="Search pre-orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-16 w-full rounded-2xl border border-cyan-400/35 bg-[#171720]/95 pl-14 pr-5 text-white placeholder:text-zinc-200/85 placeholder:uppercase placeholder:tracking-[0.08em] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/70 hover:bg-[#1A1A24] hover:shadow-[0_0_32px_rgba(34,211,238,.2)] focus:border-cyan-200 focus:outline-none focus:shadow-[0_0_46px_rgba(34,211,238,.3)]"
          />
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-3 text-sm font-medium text-cyan-300">Brand</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brandFilters.map((brand) => (
            <button
              key={brand.name}
              onClick={() => setSelectedBrand(brand.name)}
              className={`group flex aspect-[1.18] min-w-0 flex-col overflow-hidden rounded-2xl border bg-[#111118] text-left transition-all duration-300 ${
                selectedBrand === brand.name
                  ? "border-cyan-400 shadow-[0_0_28px_rgba(34,211,238,.22)]"
                  : "border-[#2B2B3A] hover:border-cyan-400/70"
              }`}
            >
              <span
                className={`flex min-h-0 flex-1 items-center justify-center bg-[#09090B] px-3 ${
                  selectedBrand === brand.name
                    ? "bg-cyan-500/10"
                    : ""
                }`}
              >
                {brand.name === "All" ? (
                  <span className="text-lg font-black uppercase text-white">
                    All
                  </span>
                ) : brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-12 w-16 object-contain sm:h-14 sm:w-20"
                  />
                ) : (
                  <span className="text-center text-sm font-black uppercase text-white">
                    {brand.name}
                  </span>
                )}
              </span>
              <span className="flex min-h-14 items-center justify-center px-3 text-center">
                <span
                  className={`line-clamp-2 break-words text-xs font-black uppercase leading-tight text-white sm:text-sm ${
                    selectedBrand === brand.name
                      ? "text-cyan-100"
                      : ""
                  }`}
                >
                  {brand.name}
                </span>
              </span>
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
          {featuredProductIds.length > 0
            ? ` • Featured picks shown first`
            : ""}
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
        <>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts
              .slice(0, visibleCount)
              .map((product) => (
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
                    badge={product.badge || undefined}
                    quantityPricing={product.quantityPricing}
                    isPreOrder={product.isPreOrder}
                    depositAmount={product.depositAmount}
                    expectedArrival={product.expectedArrival}
                    preOrderDeadline={product.preOrderDeadline}
                    originalPrice={product.price}
                    remainingPrice={getProductRemainingPrice(product)}
                    saleOriginalPrice={product.saleOriginalPrice}
                    siteDiscountPercent={product.siteDiscountPercent}
                  />
                </div>
              ))}
          </div>

          {visibleCount < filteredProducts.length ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount(
                    (current) =>
                      current +
                      LOAD_MORE_PREORDER_COUNT
                  )
                }
                className="h-12 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_24px_rgba(34,211,238,.18)]"
              >
                Load More Pre-Orders
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
