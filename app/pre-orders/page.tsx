import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { getProductPayablePrice, getProductRemainingPrice } from "@/lib/preorder"

export const dynamic = "force-dynamic"

export default async function PreOrdersPage() {
  const products = await prisma.product.findMany({
    where: {
      isPreOrder: true,
    },
    include: {
      brand: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <main className="min-h-screen bg-[#09090B] text-white">
      <Navbar />

      <section className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 bg-clip-text text-sm uppercase tracking-[0.35em] text-transparent">
            Pre Orders
          </p>
          <h1 className="mt-4 text-5xl md:text-7xl font-black">
            Secure your next drop early
          </h1>
          <p className="mt-5 max-w-2xl text-zinc-400 text-lg">
            Pay the deposit now, and the remaining amount will be collected when the product arrives.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <h2 className="text-3xl font-bold">No Pre Orders Yet</h2>
            <p className="mt-3 text-zinc-400">
              New preorder items will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={getProductPayablePrice(product)}
                image={product.images?.[0] || ""}
                description={product.description}
                stock={product.stock}
                badge={product.badge}
                quantityPricing={product.quantityPricing}
                isPreOrder={product.isPreOrder}
                depositAmount={product.depositAmount}
                expectedArrival={product.expectedArrival}
                originalPrice={product.price}
                remainingPrice={getProductRemainingPrice(product)}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
