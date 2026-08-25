"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import BrandMarquee from "@/components/brand-marquee"
import RecentlyViewedProducts
from "@/components/recently-viewed-products"
import LightweightLoading
from "@/components/lightweight-loading"
import SaleCountdown
from "@/components/sale-countdown"

const CARS_SCROLL_POSITION_KEY =
  "cars-scroll-position"

const CARS_LAST_PRODUCT_KEY =
  "cars-last-product-id"

const INITIAL_RENDER_COUNT = 18
const LOAD_MORE_COUNT = 18

type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  badge?: string
  quantityPricing?: {
    quantity: string
    price: string
    saleOriginalPrice?: number | string | null
  }[]
  saleOriginalPrice?: number | null
  siteDiscountPercent?: number | null

  brand?: {
    id: string
    name: string
    logo?: string
  }
}
type Brand = {
  id: string
  name: string
  logo?: string
}
type StoreSettings = {
  saleLaunchAt?: string | null
}

export default function CarsPage() {

  const hasRestoredScrollPosition =
    useRef(false)
  const [prefsReady, setPrefsReady] = useState(false)
  const CARS_SEARCH_KEY = "cars-search"
  const CARS_BRAND_KEY = "cars-brand"
  const CARS_STOCK_KEY = "cars-stock"
  const CARS_SORT_KEY = "cars-sort"

  const [products, setProducts] =
    useState<Product[]>([])

const [loading, setLoading] =
  useState(true)
  const [visibleCount, setVisibleCount] =
    useState(INITIAL_RENDER_COUNT)

  const [selectedBrand,
  setSelectedBrand
] = useState("All")

const [search, setSearch] =
  useState("")

const [stockFilter,
  setStockFilter
] = useState("All")
const [sortBy,
  setSortBy
] = useState("Newest")
const [storeSettings, setStoreSettings] =
  useState<StoreSettings | null>(null)
const [productsRefreshKey, setProductsRefreshKey] =
  useState(0)

  useEffect(() => {
    const savedSearch = sessionStorage.getItem(CARS_SEARCH_KEY)
    const savedBrand = sessionStorage.getItem(CARS_BRAND_KEY)
    const savedStock = sessionStorage.getItem(CARS_STOCK_KEY)
    const savedSort = sessionStorage.getItem(CARS_SORT_KEY)

    if (savedSearch !== null) setSearch(savedSearch)
    if (savedBrand !== null) setSelectedBrand(savedBrand)
    if (savedStock !== null) setStockFilter(savedStock)
    if (savedSort !== null) setSortBy(savedSort)
    setPrefsReady(true)
  }, [])

  useEffect(() => {
    if (!prefsReady) return

    sessionStorage.setItem(CARS_SEARCH_KEY, search)
    sessionStorage.setItem(CARS_BRAND_KEY, selectedBrand)
    sessionStorage.setItem(CARS_STOCK_KEY, stockFilter)
    sessionStorage.setItem(CARS_SORT_KEY, sortBy)
  }, [prefsReady, search, selectedBrand, stockFilter, sortBy])

  useEffect(() => {

 async function fetchData() {

  try {

    const [
      productsResponse,
      settingsResponse,
    ] = await Promise.all([

      fetch("/api/get-cars"),
      fetch("/api/admin/settings", {
        cache: "no-store",
      }),

    ])

    const productsData =
      await productsResponse.json()
    const settingsData =
      settingsResponse.ok
        ? await settingsResponse.json()
        : null

    const sorted =
      [...productsData].sort(
        (a, b) => {

          if (
            a.stock === 0 &&
            b.stock > 0
          ) {
            return 1
          }

          if (
            a.stock > 0 &&
            b.stock === 0
          ) {
            return -1
          }

          return 0

        }
      )

    setProducts(sorted)
    setStoreSettings(settingsData)

  } catch (error) {

    console.error(error)

  } finally {

    setLoading(false)

  }

}

  fetchData()

}, [productsRefreshKey])

useEffect(() => {

  const saveScrollPosition = () => {
    sessionStorage.setItem(
      CARS_SCROLL_POSITION_KEY,
      String(window.scrollY)
    )
  }

  window.addEventListener(
    "pagehide",
    saveScrollPosition
  )

  return () => {
    if (hasRestoredScrollPosition.current) {
      saveScrollPosition()
    }
    window.removeEventListener(
      "pagehide",
      saveScrollPosition
    )
  }

}, [])

useEffect(() => {

  if (loading) return

  const savedScrollPosition =
    sessionStorage.getItem(
      CARS_SCROLL_POSITION_KEY
    )

  const lastProductId =
    sessionStorage.getItem(
      CARS_LAST_PRODUCT_KEY
    )

  const animationFrame =
    requestAnimationFrame(() => {
      const lastProduct = lastProductId
        ? document.getElementById(
            `product-${lastProductId}`
          )
        : null

      if (lastProduct) {
        lastProduct.scrollIntoView({
          block: "center",
        })
      } else if (savedScrollPosition) {
        window.scrollTo({
          top: Number(savedScrollPosition),
          left: 0,
        })
      }

      hasRestoredScrollPosition.current = true
    })

  return () =>
    cancelAnimationFrame(animationFrame)

}, [loading])

  const brands = useMemo(
    () =>
      Array.from(
        new Map(
          products
            .filter((product) =>
              Boolean(product.brand?.name)
            )
            .map((product) => [
              product.brand!.id,
              {
                id: product.brand!.id,
                name: product.brand!.name,
                logo:
                  product.brand?.logo || "",
              },
            ])
        ).values()
      ),
    [products]
  )

const brandFilters = useMemo(() => [

  { name: "All", logo: "" },

  ...brands.map((brand) => ({
    name: brand.name,
    logo: brand.logo || "",
  })),

], [brands])

const filteredProducts = useMemo(
  () =>
    products
      .filter((product) => {
        const matchesBrand =
          selectedBrand === "All"
            ? true
            : product.brand?.name ===
              selectedBrand

        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(search.toLowerCase())

        const matchesStock =
          stockFilter === "All"
            ? true
            : stockFilter === "In Stock"
            ? product.stock > 0
            : product.stock === 0

        return (
          matchesBrand &&
          matchesSearch &&
          matchesStock
        )
      })
      .sort((a, b) => {
        const aOutOfStock = a.stock === 0
        const bOutOfStock = b.stock === 0

        if (aOutOfStock !== bOutOfStock) {
          return aOutOfStock ? 1 : -1
        }

        if (sortBy === "Price Low") {
          return a.price - b.price
        }

        if (sortBy === "Price High") {
          return b.price - a.price
        }

        if (sortBy === "Name A-Z") {
          return a.name.localeCompare(
            b.name
          )
        }

        return 0
      }),
  [
    products,
    search,
    selectedBrand,
    stockFilter,
    sortBy,
  ]
)

useEffect(() => {
  setVisibleCount(INITIAL_RENDER_COUNT)
}, [
  search,
  selectedBrand,
  stockFilter,
  sortBy,
])

if (loading) {

  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      <Navbar />

      <LightweightLoading
        label="Browse Inventory"
        message="Loading available diecast cars"
        compact
      />

    </main>

  )

}
  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      <Navbar />

      <SaleCountdown
        launchAt={storeSettings?.saleLaunchAt}
        onComplete={() =>
          setProductsRefreshKey(
            (current) => current + 1
          )
        }
      />

      <section
      
        className="
        relative
        max-w-7xl
        mx-auto
        px-4
        md:px-6
        py-20
        "
        
      >

        {/* Gold Glow */}
        <div
  className="
  absolute
  top-0
  right-0
  w-[500px]
  h-[500px]
  bg-purple-500/20
  blur-[120px]
  rounded-full
  pointer-events-none
  animate-[floatGlow_8s_ease-in-out_infinite]
  "
/>

        <div
  className="
  relative
  z-10
  animate-[fadeUp_0.8s_ease-out]
  "
>

          {/* Hero */}
          <div className="mb-14">

            <p
              className="
              bg-gradient-to-r
from-pink-500
to-purple-500
bg-clip-text
text-transparent
              uppercase
              tracking-widest
              text-sm
              "
            >
              Shinsei Diecast
            </p>

            <h1
  className="
  text-5xl
  md:text-7xl
  font-bold
  mt-4
  animate-[slideInLeft_0.8s_ease-out]
  "
>
              Premium{" "}
              <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
                Diecast
              </span>{" "}
              Cars
            </h1>
<div className="flex flex-wrap gap-4 mt-8">

  <div className="px-5 py-3 rounded-xl bg-[#15151D]
border
border-[#2B2B3A]">
    <p className="text-2xl font-bold">
      {products.length}+
    </p>
    <p className="text-sm text-gray-400">
      Models
    </p>
  </div>

  <div className="px-5 py-3 rounded-xl bg-[#D4AF37]/10">
    <p className="text-2xl font-bold">
      Premium
    </p>
    <p className="text-sm text-gray-500">
      Quality
    </p>
  </div>

  <div className="px-5 py-3 rounded-xl bg-[#D4AF37]/10">
    <p className="text-2xl font-bold">
      100%
    </p>
    <p className="text-sm text-gray-500">
      Collectible
    </p>
  </div>

</div>
           <div
  className="
  w-24
  h-1
  bg-gradient-to-r
from-pink-500
to-purple-600
  rounded-full
  mt-6
  animate-pulse
  "
/>

            <p
              className="
              text-gray-400
              mt-6
              text-lg
              max-w-2xl
              "
            >
              Explore Hot Wheels,
              Mini GT,
              Inno64,
              and premium diecast
              collectibles curated
              for enthusiasts.
            </p>

            <div className="mt-8">
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-pink-300">
                Quick Access
              </p>
              <Link
                href="/pre-orders"
                className="inline-flex h-12 items-center rounded-full border border-pink-500/40 bg-pink-500/10 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-pink-200 shadow-[0_0_18px_rgba(236,72,153,.12)] transition-all duration-300 hover:border-pink-400 hover:bg-pink-500/20 hover:shadow-[0_0_24px_rgba(236,72,153,.18)] animate-pulse"
              >
                Explore Pre-Orders
              </Link>
            </div>

          </div>
<div className="my-16">

  <BrandMarquee
    brands={brands}
  />

</div>
{/* Search */}

<div className="mb-10">

<div
  className="
  relative
  group
  rounded-2xl
  shadow-[0_0_36px_rgba(236,72,153,.2)]
  ring-1
  ring-pink-400/35
  bg-[linear-gradient(135deg,rgba(236,72,153,0.08),rgba(22,22,30,0.96))]
  "
>

    <Search
      className="
      absolute
      left-5
      top-1/2
      -translate-y-1/2
      w-5
      h-5
      text-zinc-300
      group-focus-within:text-pink-300
      transition-colors
      duration-300
      "
    />

    <input
      type="text"
      placeholder="Search diecast cars..."
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
    className="
      w-full
      h-16
      pl-14
      pr-5

      rounded-2xl

      border
      border-pink-400/35

      bg-[#171720]/95

      text-white
      placeholder:text-zinc-300/85
      placeholder:uppercase
      placeholder:tracking-[0.08em]

      transition-all
      duration-300

      focus:outline-none
      focus:border-pink-300

      focus:shadow-[0_0_46px_rgba(236,72,153,.34)]

      hover:border-pink-300/70

      hover:bg-[#1A1A24]
      hover:-translate-y-0.5
      hover:shadow-[0_0_32px_rgba(236,72,153,.22)]
      "
    />

  </div>

</div>




{/* Brand Filters */}

<div className="mb-8">

  <p className="text-pink-400 text-sm font-medium mb-3">

    Brand

  </p>

  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

    {brandFilters.map((brand) => (

      <button
        key={brand.name}
        onClick={() =>
          setSelectedBrand(brand.name)
        }
        className={`
          group
          flex
          aspect-[1.18]
          min-w-0
          flex-col
          overflow-hidden
          rounded-2xl
          border
          bg-[#111118]
          text-left
          transition-all
          duration-300
          ${
            selectedBrand === brand.name
? "border-pink-500 shadow-[0_0_28px_rgba(236,72,153,.22)]"
: "border-[#2B2B3A] hover:border-pink-500/70"
          }
        `}
      >
        <span
          className={`flex min-h-0 flex-1 items-center justify-center bg-[#09090B] px-3 ${
            selectedBrand === brand.name
              ? "bg-pink-500/10"
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
                ? "text-pink-100"
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

{/* Stock Filters */}

<div className="mb-8">

  <p className="text-pink-400 text-sm font-medium mb-3">

    Availability

  </p>

  <div className="flex flex-wrap gap-3">

    {[
      "All",
      "In Stock",
      "Sold Out",
    ].map((filter) => (

      <button
        key={filter}
        onClick={() =>
          setStockFilter(filter)
        }
        className={`
          px-5
          py-2.5
          rounded-full
          border
          transition-all
          duration-300

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

  <p className="text-gray-400">

    Showing {filteredProducts.length} Products

  </p>

  <div className="flex flex-col gap-2">
    <p className="text-pink-400 text-sm font-medium">
      Sort By
    </p>

    <select
      value={sortBy}
      onChange={(e) =>
        setSortBy(e.target.value)
      }
      className="
      h-12
      px-4
      rounded-xl
      border
      border-[#2B2B3A]
      bg-[#15151D]
      text-white
      focus:border-pink-500
      focus:outline-none
      "
    >

      <option value="Newest">
        Newest
      </option>

    <option value="Price Low">
      Price: Low to High
    </option>

    <option value="Price High">
      Price: High to Low
    </option>

      <option value="Name A-Z">
        Name: A-Z
      </option>

    </select>
  </div>

</div>
          {/* Products */}
          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-8
            "
          >

            {filteredProducts
  .slice(0, visibleCount)
  .map((product) => (

    <div
      id={`product-${product.id}`}
      key={product.id}
    >

      <ProductCard
        id={product.id}
        name={product.name}
        price={product.price}
        image={product.images?.[0]}
        description={product.description}
        stock={product.stock}
        quantityPricing={product.quantityPricing}
        saleOriginalPrice={product.saleOriginalPrice}
        siteDiscountPercent={product.siteDiscountPercent}
        badge={product.badge}
      />

    </div>

))}
          </div>

          {visibleCount <
          filteredProducts.length ? (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount(
                    (current) =>
                      current +
                      LOAD_MORE_COUNT
                  )
                }
                className="h-12 rounded-full border border-pink-500/40 bg-pink-500/10 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-pink-200 transition-all duration-300 hover:border-pink-400 hover:bg-pink-500/20 hover:shadow-[0_0_24px_rgba(236,72,153,.18)]"
              >
                Load More Cars
              </button>
            </div>
          ) : null}

        </div>

      </section>

      <RecentlyViewedProducts />

    </main>

  )

}
