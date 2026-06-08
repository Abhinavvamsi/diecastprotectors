"use client"

import { useEffect, useState } from "react"

import { Bebas_Neue } from "next/font/google"

import { Button } from "@/components/ui/button"

import { useCartStore } from "@/store/cart-store"

import ProductCard from "@/components/product-card"

import Navbar from "@/components/navbar"

import Footer from "@/components/footer"


const bebas = Bebas_Neue({

  subsets: ["latin"],

  weight: "400",

})

type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number

  quantityPricing?: {
    quantity: string
    price: string
  }[]

  badge?: string
}

export default function Home() {

  const syncStock =
    useCartStore(
      (state) => state.syncStock
    )

  const [products,
    setProducts
  ] = useState<Product[]>([])

  const [loading,
    setLoading
  ] = useState(true)

  const [selectedCategory,
    setSelectedCategory
  ] = useState("All")

  const [stockFilter,
  setStockFilter
] = useState("All")

  const [search,
    setSearch
  ] = useState("")

  useEffect(() => {

    async function fetchProducts() {

      try {

        const response =
          await fetch(
            "/api/get-products",
            {
              cache: "no-store",
            }
          )

        const data =
          await response.json()

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 1000)
        )

        setProducts(data)

        data.forEach(
          (product: Product) => {

            syncStock(
              product.id,
              product.stock
            )

          }
        )

      } catch (error) {

        console.log(error)

      } finally {

        setLoading(false)

      }

    }

    fetchProducts()

  }, [syncStock])

  const categories = [

    "All",

    ...new Set(
      products.map(
        (product) =>
          product.category
      )
    ),

  ]

  const filteredProducts =
  products.filter((product) => {

    const matchesCategory =
      selectedCategory === "All"
        ? true
        : product.category === selectedCategory

    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      product.description
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesStock =
      stockFilter === "All"
        ? true
        : stockFilter === "In Stock"
        ? product.stock > 0
        : product.stock === 0

    return (
      matchesCategory &&
      matchesSearch &&
      matchesStock
    )

  })

  return (

    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}
          <div>

            {/* Subtitle */}
            <p className="text-red-500 uppercase tracking-[0.3em] text-sm md:text-base">

              Premium Diecast & Protection

            </p>

            {/* Main Heading */}
            <h1
              className={`
                ${bebas.className}
                text-6xl
                sm:text-7xl
                md:text-8xl
                lg:text-[9rem]
                leading-[0.9]
                tracking-wide
                mt-6
                max-w-5xl
              `}
            >

              PREMIUM

              <span className="text-red-500">

                {" "}DIECAST CARS{" "}

              </span>

              <br />

              & PROTECTORS

            </h1>

            {/* Description */}
            <p className="text-zinc-300 text-lg md:text-xl mt-8 max-w-2xl leading-relaxed">

              Discover premium Hot Wheels, collectible diecast cars,
              acrylic cases and soft protectors built for passionate collectors.

            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 mt-12">

              <a href="/protectors">

                <Button
                  className="
                  rounded-2xl
                  px-10
                  py-7
                  text-lg
                  bg-red-500
                  hover:bg-red-600
                  hover:scale-105
                  active:scale-95
                  transition-all
                  duration-300
                  shadow-lg
                  shadow-red-500/20
                  hover:shadow-red-500/40
                  "
                >

                  Shop Protectors

                </Button>

              </a>

              <a href="/cars">

                <Button
                  variant="outline"
                  className="
                  rounded-2xl
                  px-10
                  py-7
                  text-lg
                  bg-transparent
                  border-red-500/40
                  hover:bg-zinc-900
                  hover:border-red-500
                  hover:scale-105
                  active:scale-95
                  transition-all
                  duration-300
                  "
                >

                  Explore Diecast Cars

                </Button>

              </a>

            </div>

          </div>

          {/* RIGHT SIDE IMAGE */}
          <div className="relative flex justify-center">

            {/* Red Glow */}
            <div
              className="
              absolute
              inset-0
              bg-red-500/20
              blur-3xl
              rounded-full
              "
            />

            {/* Hero Image */}
            <img
              src="/hero-car.png"
              alt="Premium Diecast"
              className="
              relative
              z-10
              w-full
              max-w-lg
              object-contain
              hover:scale-105
              transition-all
              duration-500
              drop-shadow-[0_0_50px_rgba(239,68,68,0.35)]
              "
            />

          </div>

        </div>

      </section>

      {/* Products Section */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 md:px-6 pb-24"
      >

        {/* Header */}
        <div className="mb-12">

          <p className="text-red-500 uppercase tracking-[0.3em] text-sm">

            Featured Products

          </p>

          <h2
            className={`
              ${bebas.className}
              text-5xl
              md:text-6xl
              mt-4
              tracking-wide
            `}
          >

            Collector Favorites

          </h2>

        </div>

        {/* Search */}
        <div className="mb-10">

          <input
            type="text"
            placeholder="Search diecast cars & protectors..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
            w-full
            h-16
            rounded-2xl
            bg-zinc-900
            border
            border-zinc-800
            px-6
            text-white
            placeholder:text-zinc-500
            outline-none
            focus:border-red-500
            transition-all
            duration-300
            "
          />

        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-12">

          {categories.map((category) => (

            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`
                px-5
                py-2.5
                rounded-full
                border
                transition-all
                duration-300
                text-sm
                md:text-base

                ${
                  selectedCategory === category

                    ? "bg-red-500 text-white border-red-500"

                    : "border-zinc-700 text-zinc-400 hover:border-red-500 hover:text-white"
                }
              `}
            >

              {category}

            </button>

          ))}

        </div>
<div className="flex flex-wrap gap-4 mb-12">

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
            ? "bg-green-500 text-white border-green-500"
            : "border-zinc-700 text-zinc-400 hover:border-green-500 hover:text-white"
        }
      `}
    >

      {filter}

    </button>

  ))}

</div>
        {/* Skeleton */}
        {loading && (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

            {[...Array(6)].map((_, i) => (

              <div
                key={i}
                className="
                animate-pulse
                rounded-3xl
                overflow-hidden
                border
                border-zinc-800
                bg-zinc-900
                "
              >

                <div className="h-72 bg-zinc-800" />

                <div className="p-6 space-y-4">

                  <div className="h-6 bg-zinc-800 rounded w-2/3" />

                  <div className="h-4 bg-zinc-800 rounded w-full" />

                  <div className="h-4 bg-zinc-800 rounded w-5/6" />

                  <div className="h-10 bg-zinc-800 rounded-xl mt-6" />

                </div>

              </div>

            ))}

          </div>

        )}

        {/* Empty */}
        {!loading &&
          filteredProducts.length === 0 && (

          <div className="text-center py-28">

            <h2 className="text-4xl font-bold">

              No products found 🔍

            </h2>

            <p className="text-zinc-500 mt-4">

              Try searching something else

            </p>

          </div>

        )}

        {/* Products */}
        {!loading && (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

            {filteredProducts.map((product) => (

             <ProductCard
  key={product.id}
  id={product.id}
  name={product.name}
  price={product.price}
  image={product.images?.[0]}
  description={product.description}
  stock={product.stock}

  quantityPricing={
    product.quantityPricing
  }

  badge={product.badge}
/>

            ))}

          </div>

        )}

      </section>

      <Footer />

    </main>

  )

}

