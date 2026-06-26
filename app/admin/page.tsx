import Link from "next/link"
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

  <main className="min-h-screen bg-white text-black">

    <Navbar />

    <div className="max-w-7xl mx-auto px-6 py-16">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-14">

        <div>

          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm">

            Diecast Universe Admin

          </p>

          <h1 className="text-5xl font-bold mt-3">

            Admin Dashboard

          </h1>

          <p className="text-gray-500 mt-4 text-lg">

            Manage products, orders, inventory and store operations.

          </p>

        </div>

        <Link href="/">

          <button
            className="
            h-14
            px-8
            rounded-2xl
            border
            border-gray-300
            hover:border-[#D4AF37]
            hover:text-[#D4AF37]
            transition
            "
          >

            Back to Store

          </button>

        </Link>

      </div>

      {/* Quick Overview */}

      <div className="grid md:grid-cols-3 gap-6 mb-12">

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">

          <p className="text-gray-500">

            Products

          </p>

          <h2 className="text-3xl font-bold mt-2">

            Manage Catalog

          </h2>

        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">

          <p className="text-gray-500">

            Orders

          </p>

          <h2 className="text-3xl font-bold mt-2">

            Track Sales

          </h2>

        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">

          <p className="text-gray-500">

            Store

          </p>

          <h2 className="text-3xl font-bold mt-2">

            Settings & Coupons

          </h2>

        </div>

      </div>

      {/* Dashboard Cards */}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* Add Product */}

        <Link
          href="/admin/add-product"
          className="
          group
          bg-white
          border
          border-gray-200
          shadow-sm
          rounded-3xl
          p-8
          hover:border-[#D4AF37]
          hover:shadow-md
          hover:-translate-y-1
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
              bg-[#D4AF37]
              text-black
              flex
              items-center
              justify-center
              text-3xl
              font-bold
              "
            >

              +

            </div>

            <div>

              <h2 className="text-3xl font-bold">

                Add Product

              </h2>

              <p className="text-gray-500 mt-4 leading-relaxed">

                Create new products with image uploads and stock management.

              </p>

            </div>

          </div>

        </Link>

        {/* Orders */}

        <Link
          href="/admin/orders"
          className="
          group
          bg-white
          border
          border-gray-200
          shadow-sm
          rounded-3xl
          p-8
          hover:border-[#D4AF37]
          hover:shadow-md
          hover:-translate-y-1
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
              bg-[#D4AF37]
              text-black
              flex
              items-center
              justify-center
              text-3xl
              font-bold
              "
            >

              📦

            </div>

            <div>

              <h2 className="text-3xl font-bold">

                Orders

              </h2>

              <p className="text-gray-500 mt-4 leading-relaxed">

                Track customer purchases and manage deliveries.

              </p>

            </div>

          </div>

        </Link>

        {/* Products */}

        <Link
          href="/admin/products"
          className="
          group
          bg-white
          border
          border-gray-200
          shadow-sm
          rounded-3xl
          p-8
          hover:border-[#D4AF37]
          hover:shadow-md
          hover:-translate-y-1
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
              bg-[#D4AF37]
              text-black
              flex
              items-center
              justify-center
              text-3xl
              font-bold
              "
            >

              🛠

            </div>

            <div>

              <h2 className="text-3xl font-bold">

                Product Management

              </h2>

              <p className="text-gray-500 mt-4 leading-relaxed">

                Edit pricing, inventory and catalog details.

              </p>

            </div>

          </div>

        </Link>
{/* Brand Management */}
<Link
  href="/admin/brands"
  className="
  group
  bg-white
  border
  border-gray-200
  rounded-3xl
  p-8
  hover:border-[#D4AF37]
  hover:-translate-y-2
  hover:shadow-md
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
      bg-[#D4AF37]
      text-black
      flex
      items-center
      justify-center
      text-3xl
      font-bold
      "
    >

      🏷️

    </div>

    <div>

      <h2 className="text-3xl font-bold">

        Brand Management

      </h2>

      <p
        className="
        text-gray-500
        mt-4
        leading-relaxed
        "
      >

        Create, edit and manage
        Hot Wheels, Mini GT,
        Inno64 and other brands.

      </p>

    </div>

  </div>

</Link>




{/* Banner Management */}

<Link
  href="/admin/banners"
  className="
  group
  bg-white
  border
  border-gray-200
  shadow-sm
  rounded-3xl
  p-8
  hover:border-[#D4AF37]
  hover:shadow-md
  hover:-translate-y-1
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
      bg-[#D4AF37]
      text-black
      flex
      items-center
      justify-center
      text-3xl
      font-bold
      "
    >
      🖼️
    </div>

    <div>

      <h2 className="text-3xl font-bold">
        Banner Management
      </h2>

      <p className="text-gray-500 mt-4 leading-relaxed">
        Create, edit and manage homepage banners.
      </p>

    </div>

  </div>

</Link>










        {/* Coupons */}

        <Link
          href="/admin/coupons"
          className="
          group
          bg-white
          border
          border-gray-200
          shadow-sm
          rounded-3xl
          p-8
          hover:border-[#D4AF37]
          hover:shadow-md
          hover:-translate-y-1
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
              bg-[#D4AF37]
              text-black
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

              <p className="text-gray-500 mt-4 leading-relaxed">

                Create and manage discount campaigns.

              </p>

            </div>

          </div>

        </Link>

        {/* Settings */}

        <Link
          href="/admin/settings"
          className="
          group
          bg-white
          border
          border-gray-200
          shadow-sm
          rounded-3xl
          p-8
          hover:border-[#D4AF37]
          hover:shadow-md
          hover:-translate-y-1
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
              bg-[#D4AF37]
              text-black
              flex
              items-center
              justify-center
              text-3xl
              font-bold
              "
            >

              ⚙️

            </div>

            <div>

              <h2 className="text-3xl font-bold">

                Store Settings

              </h2>

              <p className="text-gray-500 mt-4 leading-relaxed">

                Configure shipping, pickup and store settings.

              </p>

            </div>

          </div>

        </Link>

      </div>

    </div>

  </main>

)

}