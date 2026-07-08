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