import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { getProductPayablePrice, getProductRemainingPrice } from "@/lib/preorder"
import PreOrdersHeroAnimation from "@/components/preorders-hero-animation"

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
    <main className="relative min-h-screen overflow-hidden bg-[#09090B] text-white">
      <Navbar />
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
          <PreOrdersHeroAnimation />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        {products.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">
            <h2 className="text-3xl font-bold">No Pre-Orders Yet</h2>
            <p className="mt-3 text-zinc-400">
              New pre-order items will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-cyan-500/15 bg-white/5 p-4 shadow-[0_0_60px_rgba(34,211,238,.08)] backdrop-blur-xl md:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                  Featured pre-orders
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  Deposit-first releases with clear balance tracking
                </h2>
              </div>
              <p className="hidden text-sm text-zinc-400 md:block">
                Every card shows deposit, original price, and remaining amount.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product: any) => (
                <div
                  key={product.id}
                  className="rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02))] p-[1px] shadow-[0_0_24px_rgba(236,72,153,.08)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={getProductPayablePrice(product)}
                    image={product.images?.[0] || ""}
                    description={product.description}
                    stock={Math.max(
                      0,
                      Number(product.stock || 0) -
                        Number(product.reservedStock || 0)
                    )}
                    badge={product.badge}
                    quantityPricing={product.quantityPricing}
                    isPreOrder={product.isPreOrder}
                    depositAmount={product.depositAmount}
                    expectedArrival={product.expectedArrival}
                    originalPrice={product.price}
                    remainingPrice={getProductRemainingPrice(product)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
