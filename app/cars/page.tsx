"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import BrandMarquee from "@/components/brand-marquee"
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

    <main className="min-h-screen bg-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-20">

        <p className="text-center text-lg text-gray-500">

          Loading Diecast Cars...

        </p>

      </div>

    </main>

  )

}
  return (

    <main className="min-h-screen bg-white text-black">

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
  bg-[#D4AF37]/10
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
              text-[#D4AF37]
              uppercase
              tracking-widest
              text-sm
              "
            >
              Diecast Universe
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
              <span className="text-[#D4AF37]">
                Diecast
              </span>{" "}
              Cars
            </h1>
<div className="flex flex-wrap gap-4 mt-8">

  <div className="px-5 py-3 rounded-xl bg-[#D4AF37]/10">
    <p className="text-2xl font-bold">
      {products.length}+
    </p>
    <p className="text-sm text-gray-500">
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
  bg-[#D4AF37]
  rounded-full
  mt-6
  animate-pulse
  "
/>

            <p
              className="
              text-gray-600
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
      group-focus-within:text-[#D4AF37]
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
      border-gray-200

      bg-white

      text-black
      placeholder:text-gray-400

      transition-all
      duration-300

      focus:outline-none
      focus:border-[#D4AF37]

      focus:shadow-[0_0_30px_rgba(212,175,55,0.15)]

      hover:border-[#D4AF37]/50

      hover:-translate-y-0.5
      "
    />

  </div>

</div>




{/* Brand Filters */}

<div className="mb-8">

  <p className="text-[#D4AF37] text-sm font-medium mb-3">

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
              ? "bg-[#D4AF37] text-black border-[#D4AF37]"
              : "border-gray-300 text-gray-600 hover:border-[#D4AF37]"
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

  <p className="text-[#D4AF37] text-sm font-medium mb-3">

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
              ? "bg-[#D4AF37] text-black border-[#D4AF37]"
              : "border-gray-300 text-gray-600 hover:border-[#D4AF37]"
          }
        `}
      >

        {filter}

      </button>

    ))}

  </div>

</div>


<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

  <p className="text-gray-500">

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
    border-gray-200
    bg-white
    text-black
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

    <div key={product.id}>

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