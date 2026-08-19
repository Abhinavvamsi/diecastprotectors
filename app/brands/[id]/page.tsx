import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import BrandProducts from "@/components/brand-products"
import RecentlyViewedProducts from "@/components/recently-viewed-products"
import { getIndiaDateKey, isPreOrderDeadlineActive } from "@/lib/preorder"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function BrandPage({
  params,
}: Props) {

  const { id } =
    await params
  const todayKey = getIndiaDateKey()

  const brand =
    await prisma.brand.findUnique({

      where: {
        id,
      },

      include: {

        products: {

          orderBy: {
            createdAt: "desc",
          },

        },

      },

    })

  if (!brand) {

    notFound()

  }

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
    brand.products.filter(
      (product) =>
        !hiddenSaleIds.has(product.id) &&
        isPreOrderDeadlineActive(product, todayKey)
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

    <main className="min-h-screen bg-[#09090B] text-white">

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Header */}

        <div className="mb-14">

          <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

            Brand Collection

          </p>

          <div className="flex items-center gap-6 mt-4">

          {brand.logo && (

  <div
    className="
    w-24
    h-24
    rounded-2xl
    bg-zinc-900
    border
    border-zinc-800
    flex
    items-center
    justify-center
    flex-shrink-0
    "
  >

    <img
      src={brand.logo}
      alt={brand.name}
      className="
      w-16
      h-16
      object-contain
      "
    />

  </div>

)}

            <div>

              <h1 className="text-5xl font-bold">

                {brand.name}

              </h1>

              <p className="text-zinc-400 mt-2">

                {visibleProducts.length}
                {" "}
                Products Available

              </p>

            </div>

          </div>

        </div>

        {/* Products */}

        <BrandProducts
          products={normalizedProducts}
        />

        <RecentlyViewedProducts />

      </div>

      <Footer />

    </main>

  )

}
