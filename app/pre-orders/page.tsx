import { prisma } from "@/lib/prisma"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PreOrdersHeroAnimation from "@/components/preorders-hero-animation"
import PreOrdersBrowser from "@/components/preorders-browser"

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
          <PreOrdersBrowser products={products as any[]} />
        )}
      </section>

      <Footer />
    </main>
  )
}
