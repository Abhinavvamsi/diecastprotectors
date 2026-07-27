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
