"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Bebas_Neue } from "next/font/google"

import { Button } from "@/components/ui/button"

import { useCartStore } from "@/store/cart-store"

import ProductCard from "@/components/product-card"

import Navbar from "@/components/navbar"

import Footer from "@/components/footer"

import BrandsSection from "@/components/brands-section"

import BrandMarquee from "@/components/brand-marquee"
import PremiumLoader from "@/components/premium-loader"


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
  brandId?: string

brand?: {
  id: string
  name: string
  logo?: string
}
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
  const [brands, setBrands] =
  useState([])
  const [selectedBrand,
  setSelectedBrand
] = useState("All")

  useEffect(() => {

    async function fetchProducts() {

      try {

      const [
  productsResponse,
  brandsResponse,
] = await Promise.all([
  fetch("/api/get-products"),
  fetch("/api/admin/brands"),
])

const data =
  await productsResponse.json()

setProducts(
  data.slice(0, 9)
)


const brandData =
  await brandsResponse.json()

setBrands(brandData)
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
  const brandFilters = [

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

        const matchesBrand =

  selectedBrand === "All"

    ? true

    : product.brand?.name ===
      selectedBrand

    return (
  matchesCategory &&
  matchesBrand &&
  matchesSearch &&
  matchesStock
)

  })
  const sortedProducts =
  [...filteredProducts].sort(
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
  return (

    <main className="min-h-screen bg-white text-black overflow-x-hidden">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
<section className="max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-32">

  <div className="grid lg:grid-cols-[1fr_1.3fr] gap-10 items-center">

    {/* LEFT SIDE */}
    <div>

      <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm md:text-base">
        Premium Diecast Collectibles
      </p>

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

        <span className="text-[#D4AF37]">

          {" "}DIECAST{" "}

        </span>

        <br />

        COLLECTIONS

      </h1>

      <p className="text-gray-600 text-lg md:text-xl mt-8 max-w-2xl leading-relaxed">

        Discover premium Hot Wheels, Inno 64, Mini GT and rare collectible diecast models curated for passionate collectors.

      </p>

      <div className="mt-12">

  <Link href="/cars" prefetch>

    <Button
      variant="outline"
      className="
      rounded-2xl
      px-10
      py-7
      text-lg
      bg-transparent
      border-[#D4AF37]
      text-black
      hover:bg-[#D4AF37]
      hover:text-black
      hover:border-[#D4AF37]
      hover:scale-105
      active:scale-95
      transition-all
      duration-300
      "
    >

      Explore Diecast Cars

    </Button>

  </Link>

</div>
    </div>

    {/* RIGHT SIDE IMAGE */}
    <div className="relative flex justify-center items-center">

      {/* Gold Glow */}
      <div
        className="
        absolute
        -inset-10
        bg-[#D4AF37]/10
        blur-[120px]
        rounded-full
        animate-pulse
        "
      />

      {/* Floating Image */}
      <div
        className="
        relative
        animate-[float_6s_ease-in-out_infinite]
        "
      >

        <img
          src="/hero-car.png"
          alt="Premium Diecast"
          className="
          relative
          z-10
          w-full
          max-w-[950px]
          object-contain
          drop-shadow-[0_20px_60px_rgba(212,175,55,0.30)]
          transition-all
          duration-700
          hover:scale-105
          "
        />

      </div>

    </div>

  </div>

</section>
<BrandMarquee
  brands={brands}
/>
      {/* Brands Section */}
      <BrandsSection />

      {/* Products Section */}

      <section
        id="products"
        className="max-w-7xl mx-auto px-4 md:px-6 pb-24"
      >

        {/* Header */}
        <div className="mb-12">

          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm">

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
        

        {/* Categories */}
        


        {/* Skeleton */}
        {loading && (

  <PremiumLoader />

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

           {sortedProducts.map((product, index) => (

  <motion.div
    key={product.id}
    initial={{
      opacity: 0,
      y: 40,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
 viewport={{
  once: true,
  amount: 0.01,
}}
    transition={{
  duration: 0.3,
  delay: 0,
}}
  >

    <ProductCard
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

  </motion.div>

))}
          </div>

        )}
<div className="flex justify-center mt-12">

  <Link href="/cars">

    <Button
      className="
      bg-[#D4AF37]
      text-black
      hover:bg-[#B8941F]
      px-8
      py-6
      rounded-xl
      "
    >

      View Full Collection

    </Button>

  </Link>

</div>
      </section>

      <Footer />

    </main>

  )

}

