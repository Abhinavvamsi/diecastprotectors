import { prisma } from "@/lib/prisma"

import EditProductForm from "@/components/edit-product-form"

import AdminNav from "@/components/admin-nav"

import {
  currentUser,
} from "@clerk/nextjs/server"

import { redirect } from "next/navigation"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function EditPage({
  params,
}: Props) {

  const user =
    await currentUser()

  const isAdmin =
    user?.primaryEmailAddress
      ?.emailAddress ===
    "abhinavvamsi2004@gmail.com"

  if (!isAdmin) {

    redirect("/")

  }

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

  <main className="min-h-screen bg-white text-black p-8">

    <div className="max-w-4xl mx-auto">

      <AdminNav />

      <div className="mb-12">

        <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm">

          Diecast Universe Admin

        </p>

        <h1 className="text-5xl font-bold mt-3">

          Edit Product

        </h1>

        <p className="text-gray-500 mt-2">

          Update product information, pricing, stock and images.

        </p>

      </div>

      <div
        className="
        bg-white
        border
        border-gray-200
        shadow-sm
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