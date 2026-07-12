import { prisma } from "@/lib/prisma"

import EditProductForm from "@/components/edit-product-form"

import AdminNav from "@/components/admin-nav"

import { requireAdmin } from "@/lib/admin"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditPage({
  params,
}: Props) {

  await requireAdmin()

  const { id } =
    await params

  const product =
  await prisma.product.findUnique({
    where: {
      id,
    },
  }) as any

  if (!product) {

    return (
      <div>
        Product not found
      </div>
    )

  }

  return (

  <main className="min-h-screen bg-[#09090B] text-white p-8">

    <div className="max-w-4xl mx-auto">

      <AdminNav />

      <div className="mb-12">

        <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

          Shinsei Diecast Admin

        </p>

        <h1 className="text-5xl font-bold mt-3">

          Edit Product

        </h1>

        <p className="text-zinc-400 mt-2">

          Update product information, pricing, stock and images.

        </p>

      </div>

      <div
  className="
  bg-zinc-900
  border
  border-zinc-800
  shadow-2xl
  rounded-[2rem]
  p-6
  md:p-10
  "
>

        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="text-sm uppercase tracking-[0.25em] text-pink-400">
            Inventory Summary
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-zinc-500 text-sm">Available</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {Math.max(
                  0,
                  Number(product.stock || 0) -
                    Number(product.reservedStock || 0)
                )}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-zinc-500 text-sm">Reserved</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {Number(product.reservedStock || 0)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-zinc-500 text-sm">Total Stock</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {Number(product.stock || 0)}
              </p>
            </div>
          </div>
        </div>

        <EditProductForm
          product={{
            ...product,

            images:
              (product.images as string[]) || [],

            quantityPricing:
              (product.quantityPricing as {
                quantity: string
                price: string
              }[]) || [],
          }}
        />

      </div>

    </div>

  </main>

)
}
