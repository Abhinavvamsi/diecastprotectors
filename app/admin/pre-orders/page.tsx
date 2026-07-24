import Link from "next/link"
import AdminNav from "@/components/admin-nav"
import AdminLiveRefresh from "@/components/admin-live-refresh"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import AdminPreOrdersList from "@/components/admin-preorders-list"

export const dynamic = "force-dynamic"

export default async function AdminPreOrdersPage() {
  await requireAdmin()

  const [products, preorderOrders] = await Promise.all([
    prisma.product.findMany({
      where: {
        isPreOrder: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.order.findMany({
      where: {
        status: {
          not: "Cancelled",
        },
      },
      select: {
        products: true,
      },
    }),
  ])

  const soldStock = preorderOrders.reduce((total, order) => {
    const items = Array.isArray(order.products) ? order.products : []
    return (
      total +
      items.reduce((itemTotal: number, item: any) => {
        return item?.isPreOrder
          ? itemTotal + Number(item?.quantity || 0)
          : itemTotal
      }, 0)
    )
  }, 0)

  const currentStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0
  )
  const reservedStock = products.reduce(
    (total, product) => total + Number(product.reservedStock || 0),
    0
  )

  const preorderTotals = {
    totalStock: currentStock + soldStock,
    stockSold: soldStock,
    availableStock: Math.max(0, currentStock - reservedStock),
  }

  return (
    <main className="min-h-screen bg-[#09090B] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminLiveRefresh />
        <AdminNav />

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 bg-clip-text text-sm uppercase tracking-[0.35em] text-transparent">
              Admin Pre-Orders
            </p>
            <h1 className="mt-3 text-5xl font-bold">Manage Pre-Orders</h1>
            <p className="mt-2 text-zinc-400">
              Create, edit and track pre-order products.
            </p>
          </div>
          <Link
            href="/admin/add-product"
            className="rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-cyan-100 transition hover:scale-105 hover:border-cyan-400"
          >
            Add Pre-Order Product
          </Link>
        </div>

        <div className="mb-10 rounded-[2rem] border border-cyan-500/15 bg-white/5 p-5 shadow-[0_0_60px_rgba(34,211,238,.08)] backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Pre-Order Dashboard
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Live inventory snapshot
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Track pre-order quantity, reserved units, and stock available for new orders.
              </p>
            </div>
            <p className="text-sm text-zinc-400">
              Updated from your current catalog.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Stock",
                value: preorderTotals.totalStock,
              },
              {
                label: "Stock Sold",
                value: preorderTotals.stockSold,
              },
              {
                label: "Available Stock",
                value: preorderTotals.availableStock,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-cyan-500/15 bg-[#111118] p-5 shadow-[0_0_20px_rgba(34,211,238,.08)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="pointer-events-none absolute right-4 top-4 h-12 w-12 rounded-full bg-cyan-400/10 blur-xl animate-pulse" />
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                  {stat.label}
                </p>
                <p className="mt-4 text-4xl font-black text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <AdminPreOrdersList products={products as any[]} />
      </div>
    </main>
  )
}
