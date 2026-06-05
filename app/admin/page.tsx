import Link from "next/link"
import { toast } from "sonner"
import Navbar from "@/components/navbar"

import {
  currentUser,
} from "@clerk/nextjs/server"

import {
  redirect,
} from "next/navigation"

export default async function AdminPage() {

  const user =
    await currentUser()

  const isAdmin =
    user?.primaryEmailAddress
      ?.emailAddress ===
    "abhinavvamsi2004@gmail.com"

  if (!isAdmin) {

    redirect("/")

  }

  return (

    <main className="min-h-screen bg-black text-white">

      {/* Global Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-14">

          <div>

            <p className="text-red-500 uppercase tracking-widest text-sm">

              HW Shield Admin

            </p>

            <h1 className="text-5xl font-bold mt-3">

              Admin Dashboard

            </h1>

            <p className="text-red-500 mt-4 text-lg">

              Manage products, orders, inventory and store operations.

            </p>

          </div>

          <Link href="/">

            <button className="h-14 px-8 rounded-2xl border border-zinc-800 hover:border-white transition">

              Back to Store

            </button>

          </Link>

        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

          {/* Add Product */}
          <Link
            href="/admin/add-product"
            className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-white hover:-translate-y-2 transition-all duration-300"
          >

            <div className="space-y-6">

              <div className="w-16 h-16 rounded-2xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-3xl font-bold">

                +

              </div>

              <div>

                <h2 className="text-3xl font-bold">

                  Add Product

                </h2>

                <p className="text-red-500 mt-4 leading-relaxed">

                  Create new products with Cloudinary image uploads and stock management.

                </p>

              </div>

            </div>

          </Link>

          {/* Orders */}
          <Link
            href="/admin/orders"
            className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-white hover:-translate-y-2 transition-all duration-300"
          >

            <div className="space-y-6">

              <div className="w-16 h-16 rounded-2xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-3xl font-bold">

                📦

              </div>

              <div>

                <h2 className="text-3xl font-bold">

                  Orders

                </h2>

                <p className="text-red-500 mt-4 leading-relaxed">

                  Track customer purchases, update statuses and monitor deliveries.

                </p>

              </div>

            </div>

          </Link>

          {/* Product Management */}
          <Link
            href="/admin/products"
            className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-white hover:-translate-y-2 transition-all duration-300"
          >

            <div className="space-y-6">

              <div className="w-16 h-16 rounded-2xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-3xl font-bold">

                🛠

              </div>

              <div>

                <h2 className="text-3xl font-bold">

                  Product Management

                </h2>

                <p className="text-red-500 mt-4 leading-relaxed">

                  Edit pricing, update inventory and manage your catalog.

                </p>

              </div>

            </div>

          </Link>

          {/* Coupon Management */}
<Link
  href="/admin/coupons"
  className="
  group
  bg-zinc-900
  border
  border-zinc-800
  rounded-3xl
  p-8
  hover:border-white
  hover:-translate-y-2
  transition-all
  duration-300
  "
>

  <div className="space-y-6">

    <div
      className="
      w-16
      h-16
      rounded-2xl
      bg-red-500
      text-white
      hover:bg-red-600
      flex
      items-center
      justify-center
      text-3xl
      font-bold
      "
    >

      🎟

    </div>

    <div>

      <h2 className="text-3xl font-bold">

        Coupon Management

      </h2>

      <p
        className="
        text-red-500
        mt-4
        leading-relaxed
        "
      >

        Create, enable, disable and
        monitor coupon usage across
        your store.

      </p>

    </div>

  </div>

</Link>

        </div>

      </div>

    </main>

  )

}