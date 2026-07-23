"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  stock: number
  badge?: string
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
            Featured Picks
          </h2>
        </div>

        <p className="hidden md:block text-sm text-zinc-400 max-w-md text-right">
          Hand-picked deals that auto-rotate and always stay in stock.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-pink-500/20 bg-[#111118] shadow-[0_0_60px_rgba(236,72,153,.10)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,.16),transparent_35%)]" />
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#111118] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#111118] to-transparent z-10" />

        <div className="marquee py-8">
          {cards.map((product, index) => (
            <Link
              key={`${product.id}-${index}`}
              href={`/products/${product.id}`}
              prefetch={true}
              className="mx-4 w-[290px] shrink-0"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-[#15151D] shadow-[0_0_30px_rgba(236,72,153,.10)]"
              >
                <div className="relative h-56 bg-[#0D0D12]">
                  <Image
                    src={product.images?.[0] || ""}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/90 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold uppercase tracking-wider text-white">
                    Featured Pick
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-xs font-semibold text-pink-300 border border-pink-500/20">
                    {product.stock > 0 ? `${product.stock} Left` : "Auto-Replaced"}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-pink-400">
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
                        Starting At
                      </p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
                        ₹{product.price}
                      </p>
                    </div>
                    <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-xs font-semibold text-pink-300">
                      View Product
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
