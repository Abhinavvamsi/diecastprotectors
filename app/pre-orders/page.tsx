import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PreOrdersBrowser from "@/components/preorders-browser"
import RecentlyViewedProducts from "@/components/recently-viewed-products"
import SaleCountdown from "@/components/sale-countdown"
import { getIndiaDateKey } from "@/lib/preorder"

export const dynamic = "force-dynamic"

export default async function PreOrdersPage() {
  const todayKey = getIndiaDateKey()

  const [products, settingsRows] = await Promise.all([
    prisma.product.findMany({
      where: {
        isPreOrder: true,
      },
      include: {
        brand: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.$queryRaw<
      Array<{
        preOrderFeaturedProductIds: unknown
        saleLaunchAt: string | null
      }>
    >`
      SELECT "preOrderFeaturedProductIds", "saleLaunchAt"
      FROM "StoreSettings"
      LIMIT 1
    `.catch(() => []),
  ])

  const preOrderFeaturedProductIds =
    Array.isArray(settingsRows[0]?.preOrderFeaturedProductIds)
      ? settingsRows[0].preOrderFeaturedProductIds.filter(
          (productId): productId is string =>
            typeof productId === "string"
        )
      : []
  const saleLaunchAt =
    settingsRows[0]?.saleLaunchAt ?? null

  const activeProducts = products.filter(
    (product) =>
      !product.preOrderDeadline ||
      product.preOrderDeadline >= todayKey
  )

  const hiddenSaleIds = new Set(
    (
      await prisma.$queryRaw<
        Array<{
          id: string
        }>
      >`
        SELECT id
        FROM "Product"
        WHERE "saleHiddenUntil" IS NOT NULL
          AND "saleHiddenUntil" > ${new Date().toISOString()}
      `
    ).map((product) => product.id)
  )

  const visibleProducts =
    activeProducts.filter(
      (product) => !hiddenSaleIds.has(product.id)
    )

  const normalizedProducts =
    visibleProducts.map((product) => ({
      ...product,
      images: Array.isArray(product.images)
        ? product.images.filter(
            (image): image is string =>
              typeof image === "string"
          )
        : [],
      quantityPricing: Array.isArray(product.quantityPricing)
        ? product.quantityPricing.filter(
            (
              item
            ): item is {
              quantity: string
              price: string
            } =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as { quantity?: unknown }).quantity ===
                "string" &&
              typeof (item as { price?: unknown }).price === "string"
          )
        : [],
    }))

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#09090B] text-white">
      <Navbar />
      <SaleCountdown
        launchAt={saleLaunchAt}
        refreshOnComplete
      />
      <div className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[150px] animate-pulse" />
      <div className="pointer-events-none absolute left-0 top-1/3 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse" />

      <section className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 bg-clip-text text-sm uppercase tracking-[0.35em] text-transparent drop-shadow-[0_0_16px_rgba(34,211,238,.35)]">
            Pre-Orders
          </p>
          <h1 className="mt-4 text-5xl md:text-7xl font-black bg-gradient-to-r from-white via-pink-100 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(236,72,153,.2)]">
            Secure your next drop early
          </h1>
          <p className="mt-5 max-w-2xl text-zinc-400 text-lg">
            Reserve now with a deposit, and complete the balance when the product arrives.
          </p>

          <div className="mt-8">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-300">
              Quick Access
            </p>
            <Link
              href="/cars"
              className="inline-flex h-12 items-center rounded-full border border-cyan-400/40 bg-cyan-500/10 px-6 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,.12)] transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_24px_rgba(34,211,238,.18)] animate-pulse"
            >
              Explore Available Stock
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        {visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <h2 className="text-3xl font-bold">No Pre-Orders Yet</h2>
            <p className="mt-3 text-zinc-400">
              New pre-order items will appear here.
            </p>
          </div>
        ) : (
          <PreOrdersBrowser
            products={normalizedProducts}
            featuredProductIds={preOrderFeaturedProductIds}
          />
        )}
      </section>

      <RecentlyViewedProducts
        title="Recently Viewed"
        subtitle="Return to the pre-order collectibles you explored earlier."
      />

      <Footer />
    </main>
  )
}
