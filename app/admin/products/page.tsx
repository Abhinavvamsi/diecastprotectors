export const dynamic = "force-dynamic"

import Image from "next/image"
import AdminNav from "@/components/admin-nav"
import AdminProductsList
from "@/components/admin-products-list"

import { prisma } from "@/lib/prisma"

import {
  currentUser,
} from "@clerk/nextjs/server"

import { redirect } from "next/navigation"

export default async function ProductsPage() {

  const user =
    await currentUser()

  const isAdmin =
    user?.primaryEmailAddress
      ?.emailAddress ===
    "abhinavvamsi2004@gmail.com"

  if (!isAdmin) {

    redirect("/")

  }

  const products =
  await prisma.product.findMany({

    include: {
      brand: true,
    },

    orderBy: {
      createdAt: "desc",
    },

  })
const brands =
  await prisma.brand.findMany({

    orderBy: {
      name: "asc",
    },

  })
  return (

  <main className="min-h-screen bg-white text-black p-8">

    <div className="max-w-7xl mx-auto">

  <AdminNav />

  <div className="mb-12">

    <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm">

      Diecast Universe Admin

    </p>

    <h1 className="text-5xl font-bold mt-3">

      Product Management

    </h1>

    <p className="text-gray-500 mt-2">

      Manage cars, protectors and collectibles.

    </p>

  </div>

  {/* ADD HERE */}

  <div className="flex justify-end mb-10">

    <a href="/admin/add-product">

      <button

        className="

        px-6

        h-12

        rounded-xl

        bg-[#D4AF37]

        text-black

        font-semibold

        hover:bg-[#B8941F]

        transition

        "

      >

        + Add Product

      </button>

    </a>

  </div>

      {products.length === 0 && (

        <div
          className="
          bg-white
          border
          border-gray-200
          shadow-sm
          rounded-3xl
          p-12
          text-center
          "
        >

          <h2 className="text-2xl font-bold">
            No Products Found
          </h2>

          <p className="text-gray-500 mt-2">
            Add your first product to get started.
          </p>

        </div>

      )}

      <AdminProductsList
  products={products}
  brands={brands}
/>

    </div>

  </main>

)

}
