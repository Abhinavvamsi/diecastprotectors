import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"

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

                {brand.products.length}
                {" "}
                Products Available

              </p>

            </div>

          </div>

        </div>

        {/* Products */}

        {brand.products.length === 0 ? (

          <div
            className="
bg-zinc-900
border
border-zinc-800
rounded-3xl
p-12
text-center
"
          >

            <h2 className="text-2xl font-bold">

              No Products Found

            </h2>

          </div>

        ) : (

          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-8
            "
          >

            {brand.products.map(
              (product: any) => (

                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0]}
                  description={
                    product.description
                  }
                  stock={product.stock}
                  quantityPricing={
                    product.quantityPricing
                  }
                  badge={
                    product.badge
                  }
                />

              )
            )}

          </div>

        )}

      </div>

      <Footer />

    </main>

  )

}