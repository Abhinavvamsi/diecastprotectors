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

  const [products,
    setProducts
  ] = useState<Product[]>([])

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
      product.category ===
      "Cars"
  )

      setProducts(filtered)

    }

    fetchProducts()

  }, [])

  return (

    <main className="min-h-screen bg-background text-foreground">

      <Navbar />

      <section className="max-w-7xl mx-auto px-4 md:px-6 py-20">

        <div className="mb-14">

          <p className="text-red-500 uppercase tracking-widest text-sm">

            HW Shield

          </p>

          <h1 className="text-5xl md:text-7xl font-bold mt-4">

            Premium Diecast Cars

          </h1>

          <p className="text-red-500 mt-6 text-lg max-w-2xl">

            Explore premium Hot Wheels and collectible diecast models.

          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {products.map((product) => (

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

          ))}

        </div>

      </section>

    </main>

  )

}