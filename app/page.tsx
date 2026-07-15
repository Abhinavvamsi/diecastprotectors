"use client"
import BannerSlider from "@/components/banner-slider"
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
import SuperDealsSection from "@/components/super-deals-section"
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

type Banner = {
  id: string
  title: string
  subtitle?: string
  images: {
    desktop: string
    mobile: string
  }
  buttonText?: string
  buttonLink?: string
  order: number
  active: boolean
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
const [brands, setBrands] = useState<any[]>([])
const [banners, setBanners] = useState<Banner[]>([])
const [allProducts, setAllProducts] = useState<Product[]>([])
const [storeSettings, setStoreSettings] = useState<any>(null)
  const [showLoader, setShowLoader] =
  useState(true)

  const [selectedBrand,
  setSelectedBrand
] = useState("All")

  useEffect(() => {

    async function fetchProducts() {

      try {

    const [
  productsResponse,
  brandsResponse,
  bannersResponse,
  settingsResponse,
] = await Promise.all([
  fetch("/api/get-products"),
  fetch("/api/admin/brands"),
  fetch("/api/banners"),
  fetch("/api/admin/settings"),
])

const data = await productsResponse.json()
const inStockProducts = data.filter(
  (product: Product) => product.stock > 0
)
setAllProducts(inStockProducts)
setProducts(inStockProducts.slice(0, 9))

const brandData = await brandsResponse.json()
setBrands(brandData)

const bannerData = await bannersResponse.json()
setBanners(bannerData)

const settingsData = await settingsResponse.json()
setStoreSettings(settingsData)

inStockProducts.forEach((product: Product) => {
  syncStock(product.id, product.stock)
})

      } catch (error) {

        console.log(error)

      } finally {

        setLoading(false)

      }

    }

    fetchProducts()

  }, [syncStock])
useEffect(() => {

  const visited =
    sessionStorage.getItem(
      "home-loaded"
    )

  if (visited) {

    setShowLoader(false)

  } else {

    sessionStorage.setItem(
      "home-loaded",
      "true"
    )

  }

}, [])
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

  const superDealProducts = (() => {
    const selectedIds = Array.isArray(storeSettings?.superDealProductIds)
      ? storeSettings.superDealProductIds
      : []
    const picked: Product[] = []
    const usedIds = new Set<string>()

    for (const id of selectedIds) {
      const product = allProducts.find((item) => item.id === id)
      if (product && !usedIds.has(product.id)) {
        picked.push(product)
        usedIds.add(product.id)
      }
    }

    for (const product of allProducts) {
      if (picked.length >= 6) break
      if (usedIds.has(product.id)) continue
      picked.push(product)
      usedIds.add(product.id)
    }

    return picked.slice(0, 6)
  })()

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
  if (loading) {

  return <PremiumLoader />

}
  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      {/* Navbar */}
      <Navbar />

{/* Hero Banner */}
<BannerSlider banners={banners} />
<BrandMarquee
  brands={brands}
/>
<SuperDealsSection products={superDealProducts} />
      {/* Brands Section */}
      <BrandsSection brands={brands} />

      {/* Products Section */}

      <section
        id="products"
        className="max-w-7xl mx-auto px-4 md:px-6 pb-24"
      >

        {/* Header */}
        <div className="mb-12">

          <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-[0.3em] text-sm font-semibold">

            Featured Products

          </p>

        <h2
  className={`
    ${bebas.className}
    text-5xl
    md:text-6xl
    mt-4
    tracking-wide
    bg-gradient-to-r
    from-pink-500
    via-fuchsia-400
    to-purple-500
    bg-clip-text
    text-transparent
  `}
>

            Collector Favorites

          </h2>

        </div>

        {/* Search */}
        

        {/* Categories */}
        




        {/* Empty */}
        {!loading &&
          filteredProducts.length === 0 && (

          <div className="text-center py-28">

            <h2 className="text-4xl font-bold">

              No products found 🔍

            </h2>

            <p className="text-zinc-400 mt-4">

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
  bg-gradient-to-r
  from-pink-500
  via-fuchsia-500
  to-purple-600
  text-white
  hover:scale-105
  hover:shadow-[0_0_30px_rgba(236,72,153,0.45)]
  transition-all
  duration-300
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
