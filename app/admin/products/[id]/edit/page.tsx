import { prisma } from "@/lib/prisma"

import EditProductForm from "@/components/edit-product-form"

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

    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-5xl font-bold mb-12">

          Edit Product

        </h1>

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

    </main>

  )

}