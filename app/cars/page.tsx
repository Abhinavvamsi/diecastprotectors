"use client"

import { useEffect, useState } from "react"
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
<div className="mb-12">

  <p className="text-[#D4AF37] uppercase tracking-wider text-sm mb-4">

    Browse By Brand

  </p>

  <div className="flex flex-wrap gap-4">

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
  .filter((product) =>

    selectedBrand === "All"

      ? true

      : product.brand?.name ===
        selectedBrand

  )
  .map((product, index) => (

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