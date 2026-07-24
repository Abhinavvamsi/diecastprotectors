export const dynamic = "force-dynamic"

import AdminNav from "@/components/admin-nav"
import AdminProductsList from "@/components/admin-products-list"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export default async function ProductsPage() {
  await requireAdmin()

  const [products, brands] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        stock: true,
        reservedStock: true,
        badge: true,
        isPreOrder: true,
        brandId: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ])

  return (
    <main className="min-h-screen bg-[#09090B] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div className="mb-12">
          <p className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-sm uppercase tracking-[0.3em] text-transparent">
            Shinsei Diecast Admin
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Product Management
          </h1>

          <p className="mt-2 text-zinc-400">
            Manage cars, protectors and collectibles.
          </p>
        </div>

        <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-pink-400">
                Quick Access
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Explore inventory and upcoming drops
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Fast links for mobile shoppers to jump between live inventory and upcoming drops.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/cars"
                className="relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 px-6 text-sm font-semibold uppercase tracking-[0.18em] text-pink-200 shadow-[0_0_18px_rgba(236,72,153,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-400 hover:bg-pink-500/20 hover:shadow-[0_0_34px_rgba(236,72,153,.32)] animate-pulse"
              >
                Explore our ready to dispatch products
              </a>
              <a
                href="/pre-orders"
                className="relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 px-6 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_34px_rgba(34,211,238,.32)] animate-pulse"
              >
                Explore our pre-orders
              </a>
            </div>
          </div>
        </div>

        <div className="mb-10 flex justify-end">
          <a
            href="/admin/add-product"
            className="flex h-12 items-center rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-6 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(236,72,153,.4)]"
          >
            + Add Product
          </a>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center shadow-2xl">
            <h2 className="text-2xl font-bold">
              No Products Found
            </h2>

            <p className="mt-2 text-zinc-400">
              Add your first product to get started.
            </p>
          </div>
        ) : (
          <AdminProductsList products={products} brands={brands} />
        )}
      </div>
    </main>
  )
}
