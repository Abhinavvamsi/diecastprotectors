export const dynamic = "force-dynamic"

import Image from "next/image"
import AdminNav from "@/components/admin-nav"
import AdminProductsList
from "@/components/admin-products-list"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"


export default async function ProductsPage() {

  await requireAdmin()

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

  <main className="min-h-screen bg-[#09090B] text-white p-8">

    <div className="max-w-7xl mx-auto">

  <AdminNav />

  <div className="mb-12">

    <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

      Shinsei Diecast Admin

    </p>

    <h1 className="text-5xl font-bold mt-3">

      Product Management

    </h1>

    <p className="text-zinc-400 mt-2">

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
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
font-semibold
transition-all
duration-300
hover:scale-105
hover:shadow-[0_0_30px_rgba(236,72,153,.4)]
"

      >

        + Add Product

      </button>

    </a>

  </div>

      {products.length === 0 && (

        <div
         className="
bg-zinc-900
border
border-zinc-800
rounded-3xl
p-12
text-center
shadow-2xl
"
        >

          <h2 className="text-2xl font-bold">
            No Products Found
          </h2>

          <p className="text-zinc-400 mt-2">
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
