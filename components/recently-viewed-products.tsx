"use client"

import { useEffect, useState } from "react"

import ProductCard from "@/components/product-card"
import {
  readRecentlyViewedProducts,
  RECENTLY_VIEWED_PRODUCTS_KEY,
  RECENTLY_VIEWED_PRODUCTS_LIMIT,
  type RecentlyViewedProduct,
} from "@/lib/recently-viewed"

type RecentlyViewedProductsProps = {
  currentProductId?: string
  title?: string
  subtitle?: string
}

export default function RecentlyViewedProducts({
  currentProductId,
  title = "Recently Viewed",
  subtitle = "Jump back into the cars you checked out earlier.",
}: RecentlyViewedProductsProps) {
  const [products, setProducts] = useState<
    RecentlyViewedProduct[]
  >([])

  useEffect(() => {
    const controller = new AbortController()

    const recentlyViewed =
      readRecentlyViewedProducts().filter(
        (product) =>
          product.id !== currentProductId &&
          Number(product.stock || 0) > 0
      )

    setProducts(recentlyViewed)

    async function refreshAvailability() {
      try {
        const response = await fetch(
          "/api/get-products?includePreOrder=true",
          {
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          return
        }

        const catalog = await response.json()

        if (!Array.isArray(catalog)) {
          return
        }

        const availableById = new Map<
          string,
          RecentlyViewedProduct
        >(
          catalog
            .filter(
              (product) =>
                product?.id &&
                Number(product?.stock || 0) > 0
            )
            .map((product) => [
              product.id,
              {
                id: product.id,
                name: product.name,
                price: Number(product.price || 0),
                originalPrice:
                  product.originalPrice === undefined
                    ? undefined
                    : Number(product.originalPrice || 0),
                image:
                  product.image ||
                  product.images?.[0] ||
                  "",
                description:
                  product.description || "",
                stock: Number(product.stock || 0),
                badge: product.badge || undefined,
                isPreOrder: Boolean(
                  product.isPreOrder
                ),
                depositAmount:
                  product.depositAmount === undefined
                    ? undefined
                    : Number(product.depositAmount),
                expectedArrival:
                  product.expectedArrival || undefined,
                preOrderDeadline:
                  product.preOrderDeadline || undefined,
                remainingPrice:
                  product.remainingPrice === undefined
                    ? undefined
                    : Number(product.remainingPrice || 0),
                quantityPricing:
                  product.quantityPricing || undefined,
              },
            ])
        )

        const liveRecentlyViewed =
          readRecentlyViewedProducts()
            .map((product) => {
              const liveProduct =
                availableById.get(product.id)

              if (!liveProduct) {
                return null
              }

              return {
                ...product,
                name: liveProduct.name,
                image: liveProduct.image,
                description:
                  liveProduct.description,
                stock: liveProduct.stock,
                badge: liveProduct.badge,
                expectedArrival:
                  liveProduct.expectedArrival,
                preOrderDeadline:
                  liveProduct.preOrderDeadline,
              }
            })
            .filter(Boolean) as RecentlyViewedProduct[]

        setProducts(
          liveRecentlyViewed.filter(
            (product) =>
              product.id !== currentProductId
          )
        )

        window.localStorage.setItem(
          RECENTLY_VIEWED_PRODUCTS_KEY,
          JSON.stringify(
            liveRecentlyViewed.slice(
              0,
              RECENTLY_VIEWED_PRODUCTS_LIMIT
            )
          )
        )
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return
        }
      }
    }

    refreshAvailability()

    return () => {
      controller.abort()
    }
  }, [currentProductId])

  if (products.length === 0) {
    return null
  }

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-12">
      <div className="mb-7 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-pink-400">
            Quick Return
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-white">
            {title}
          </h2>
        </div>

        <p className="max-w-md text-sm text-zinc-400">
          {subtitle}
        </p>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[280px] shrink-0 md:w-[320px]"
          >
            <ProductCard
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              description={product.description}
              stock={product.stock}
              badge={product.badge}
              isPreOrder={product.isPreOrder}
              depositAmount={product.depositAmount}
              expectedArrival={product.expectedArrival}
              preOrderDeadline={product.preOrderDeadline}
              remainingPrice={product.remainingPrice}
              saleOriginalPrice={product.saleOriginalPrice}
              siteDiscountPercent={product.siteDiscountPercent}
              quantityPricing={product.quantityPricing}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
