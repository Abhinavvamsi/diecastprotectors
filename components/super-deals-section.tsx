"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  getProductPayablePrice,
  getProductRemainingPrice,
} from "@/lib/preorder"

type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  stock: number
  badge?: string
  isPreOrder?: boolean
  depositAmount?: number
  expectedArrival?: string | null
  remainingPrice?: number
  saleOriginalPrice?: number | null
  siteDiscountPercent?: number | null
  brand?: {
    name?: string
  }
}

export default function SuperDealsSection({
  products,
}: {
  products: Product[]
}) {
  if (!products.length) return null

  const cards = [...products, ...products]

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
            Curated Highlights
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 bg-gradient-to-r from-white via-pink-100 to-purple-100 bg-clip-text text-transparent">
            Super Deals
          </h2>
        </div>

        <p className="hidden md:block text-sm text-zinc-400 max-w-md text-right">
          Hand-picked ready-stock and pre-order highlights that auto-rotate.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-pink-500/20 bg-[#111118] shadow-[0_0_60px_rgba(236,72,153,.10)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,.14),transparent_35%)]" />
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#111118] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#111118] to-transparent z-10" />

        <div className="marquee py-8">
          {cards.map((product, index) => {
            const isPreOrder = Boolean(product.isPreOrder)
            const payablePrice = isPreOrder
              ? getProductPayablePrice(product)
              : product.price
            const remainingPrice = isPreOrder
              ? getProductRemainingPrice(product)
              : 0
            const showRegularDiscount =
              !isPreOrder &&
              Number(product.siteDiscountPercent || 0) > 0 &&
              Number(product.saleOriginalPrice || 0) > payablePrice
            const showPreOrderDiscount =
              isPreOrder &&
              Number(product.siteDiscountPercent || 0) > 0 &&
              Number(product.saleOriginalPrice || 0) > Number(product.price || 0)

            return (
              <Link
                key={`${product.id}-${index}`}
                href={`/products/${product.id}`}
                prefetch={true}
                className="mx-4 w-[290px] shrink-0"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className={`relative overflow-hidden rounded-[1.75rem] border bg-[#15151D] ${
                    isPreOrder
                      ? "border-cyan-500/25 shadow-[0_0_30px_rgba(34,211,238,.12)]"
                      : "border-zinc-800 shadow-[0_0_30px_rgba(236,72,153,.10)]"
                  }`}
                >
                  <div className="relative h-56 bg-[#0D0D12]">
                    <Image
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/90 via-transparent to-transparent" />
                    <div
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
                        isPreOrder
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                          : "bg-gradient-to-r from-pink-500 to-purple-600"
                      }`}
                    >
                      {isPreOrder ? "Pre-Order Pick" : "Featured Pick"}
                    </div>
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-xs font-semibold border ${
                        isPreOrder
                          ? "text-cyan-200 border-cyan-500/25"
                          : "text-pink-300 border-pink-500/20"
                      }`}
                    >
                      {product.stock > 0
                        ? isPreOrder
                          ? `${product.stock} Slots`
                          : `${product.stock} Left`
                        : "Auto-Replaced"}
                    </div>
                  </div>

                  <div className="p-5">
                    <p
                      className={`text-[11px] uppercase tracking-[0.28em] ${
                        isPreOrder ? "text-cyan-300" : "text-pink-400"
                      }`}
                    >
                      {product.brand?.name || "Featured"}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-white line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-400 line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {isPreOrder ? "Deposit Today" : "Starting At"}
                        </p>
                        <p
                          className={`text-3xl font-bold bg-clip-text text-transparent ${
                            isPreOrder
                              ? "bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500"
                              : "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500"
                          }`}
                        >
                          ₹{payablePrice}
                        </p>
                        {showRegularDiscount ? (
                          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-pink-200/90">
                            <span className="mr-2 text-zinc-500 line-through">
                              ₹{product.saleOriginalPrice}
                            </span>
                            {product.siteDiscountPercent}% off
                          </div>
                        ) : null}
                        {isPreOrder ? (
                          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200/90">
                            <p>
                              Original{" "}
                              {showPreOrderDiscount ? (
                                <span className="mr-2 text-cyan-100/40 line-through">
                                  ₹{product.saleOriginalPrice}
                                </span>
                              ) : null}
                              ₹{product.price}
                            </p>
                            <p>
                              Balance ₹{remainingPrice}
                              {product.expectedArrival
                                ? ` • ${product.expectedArrival}`
                                : ""}
                            </p>
                          </div>
                        ) : null}
                      </div>
                      <span
                        className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                          isPreOrder
                            ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                            : "border-pink-500/30 bg-pink-500/10 text-pink-300"
                        }`}
                      >
                        {isPreOrder ? "Reserve Now" : "View Product"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
