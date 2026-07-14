"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import BrandMarquee from "@/components/brand-marquee"

const CARS_SCROLL_POSITION_KEY =
  "cars-scroll-position"

const CARS_LAST_PRODUCT_KEY =
  "cars-last-product-id"

type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  badge?: string

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

export default function CarsPage() {

  const hasRestoredScrollPosition =
    useRef(false)

  const [products, setProducts] =
    useState<Product[]>([])
const [brands, setBrands] =
  useState<Brand[]>([])

const [loading, setLoading] =
  useState(true)

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
  useEffect(() => {

 async function fetchData() {

  try {

    const [
      productsResponse,
      brandsResponse,
    ] = await Promise.all([

      fetch("/api/get-cars"),

      fetch("/api/admin/brands"),

    ])

    const productsData =
      await productsResponse.json()

    const brandsData =
      await brandsResponse.json()

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

    setBrands(brandsData)

  } catch (error) {

    console.error(error)

  } finally {

    setLoading(false)

  }

}

  fetchData()

}, [])

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

const brandFilters: string[] = [

  "All",

  ...new Set(

    products
      .map(
        (product) =>
          product.brand?.name
      )
      .filter(
        (brand): brand is string =>
          Boolean(brand)
      )

  ),

]
if (loading) {

  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-20">

        <p className="text-center text-lg text-gray-400">

          Loading Diecast Cars...

        </p>

      </div>

    </main>

  )

}
  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      <Navbar />

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
  shadow-[0_0_30px_rgba(236,72,153,.14)]
  ring-1
  ring-pink-500/20
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
      text-gray-400
      group-focus-within:text-pink-500
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
      border-[#2B2B3A]

      bg-[#15151D]

      text-white
      placeholder:text-gray-400

      transition-all
      duration-300

      focus:outline-none
      focus:border-pink-500

      focus:shadow-[0_0_42px_rgba(236,72,153,.38)]

      hover:border-pink-500/60

      hover:-translate-y-0.5
      hover:shadow-[0_0_28px_rgba(236,72,153,.18)]
      "
    />

  </div>

</div>




{/* Brand Filters */}

<div className="mb-8">

  <p className="text-pink-400 text-sm font-medium mb-3">

    Brand

  </p>

  <div className="flex flex-wrap gap-3">

    {brandFilters.map((brand) => (

      <button
        key={brand}
        onClick={() =>
          setSelectedBrand(brand)
        }
        className={`
          px-5
          py-2.5
          rounded-full
          border
          transition-all
          duration-300

          ${
            selectedBrand === brand
? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent"
: "border-[#2B2B3A] text-gray-300 hover:border-pink-500"
          }
        `}
      >

        {brand}

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

    Showing {

      products.filter((product) => {

        const matchesBrand =
          selectedBrand === "All"
            ? true
            : product.brand?.name === selectedBrand

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

      }).length

    } Products

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

            {products
  .filter((product) => {

    const matchesBrand =
      selectedBrand === "All"
        ? true
        : product.brand?.name === selectedBrand

    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )

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

  })

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
        badge={product.badge}
      />

    </div>

))}
          </div>

        </div>

      </section>

    </main>

  )

}
