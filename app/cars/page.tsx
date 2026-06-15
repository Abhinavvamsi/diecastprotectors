"use client"

import { useEffect, useState } from "react"

import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"

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

export default function CarsPage() {

  const [products, setProducts] =
    useState<Product[]>([])

  useEffect(() => {

    async function fetchProducts() {

      const response =
        await fetch(
          "/api/get-products",
          {
            cache: "no-store",
          }
        )

      const data =
        await response.json()

      const filtered =
        data.filter(
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

    }

    fetchProducts()

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
          "
        />

        <div className="relative z-10">

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
              "
            >
              Premium{" "}
              <span className="text-[#D4AF37]">
                Diecast
              </span>{" "}
              Cars
            </h1>

            <div
              className="
              w-24
              h-1
              bg-[#D4AF37]
              rounded-full
              mt-6
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

            {products.map(
              (product) => (

                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0]}
                  description={product.description}
                  stock={product.stock}
                  badge={product.badge}
                />

              )
            )}

          </div>

        </div>

      </section>

    </main>

  )

}