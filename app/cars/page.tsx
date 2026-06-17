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

  useEffect(() => {

  async function fetchData() {

    try {

      const [
        productsResponse,
        brandsResponse,
      ] = await Promise.all([

        fetch(
          "/api/get-products",
          {
            cache: "no-store",
          }
        ),

        fetch(
          "/api/admin/brands"
        ),

      ])

      const productsData =
        await productsResponse.json()

      const brandsData =
        await brandsResponse.json()

      const filtered =
        productsData.filter(
          (product: Product) =>
            product.category === "Cars"
        )

      const sorted =
        [...filtered].sort(
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

    }

  }

  fetchData()

}, [])

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

            {products.map((product, index) => (

  <motion.div
    key={product.id}
    initial={{
      opacity: 0,
      y: 20,
    }}
    whileInView={{
      opacity: 1,
      y: 0,
    }}
    viewport={{
      once: true,
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
      badge={product.badge}
    />

  </motion.div>

))}

          </div>

        </div>

      </section>

    </main>

  )

}