import Link from "next/link"
import AdminNav from "@/components/admin-nav"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

export const dynamic = "force-dynamic"

export default async function AdminPreOrdersPage() {
  await requireAdmin()

  const products = await prisma.product.findMany({
    where: {
      isPreOrder: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <main className="min-h-screen bg-[#09090B] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 bg-clip-text text-sm uppercase tracking-[0.35em] text-transparent">
              Admin Pre Orders
            </p>
            <h1 className="mt-3 text-5xl font-bold">Manage Pre Orders</h1>
            <p className="mt-2 text-zinc-400">
              Create, edit and track preorder products.
            </p>
          </div>
          <Link
            href="/admin/add-product"
            className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-cyan-100 transition hover:scale-105 hover:border-cyan-400"
          >
            Add Pre Order Product
          </Link>
        </div>

        <div className="grid gap-6">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center">
              <h2 className="text-2xl font-bold">No Pre Order Products</h2>
              <p className="mt-3 text-zinc-400">
                Mark a product as preorder from the add/edit product screens.
              </p>
            </div>
          ) : (
            products.map((product: any) => (
              <div
                key={product.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
              >
                {(() => {
                  const availableStock = Math.max(
                    0,
                    Number(product.stock || 0) -
                      Number(product.reservedStock || 0)
                  )

                  return (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{product.name}</h2>
                    <p className="mt-2 text-zinc-400">
                      Deposit: {Number(product.depositAmount || 50)}% • Remaining: ₹
                      {Math.max(0, Number(product.price || 0) - Math.floor(Number(product.price || 0) * Number(product.depositAmount || 50) / 100))}
                    </p>
                    <p className="mt-1 text-zinc-400">
                      Expected arrival: {product.expectedArrival || "Not set"}
                    </p>
                    <p className="mt-1 text-zinc-400">
                      Available stock: {availableStock} • Reserved: {Number(product.reservedStock || 0)} • Total: {Number(product.stock || 0)}
                    </p>
                  </div>
                  {availableStock <= 0 && (
                    <span className="inline-flex self-start rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-300 md:self-center">
                      Sold Out
                    </span>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/orders?productId=${product.id}`}
                      className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 font-semibold text-cyan-100 transition hover:scale-105 hover:border-cyan-400"
                    >
                      View Orders
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-5 py-3 font-semibold text-white transition hover:scale-105"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
                  )
                })()}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
