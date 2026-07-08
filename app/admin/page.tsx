import Link from "next/link"
import Navbar from "@/components/navbar"
import { requireAdmin } from "@/lib/admin"

export default async function AdminPage() {

  const { admin } =
  await requireAdmin()

  return (

  <main className="min-h-screen bg-[#09090B] text-white">

    <Navbar />

    <div className="max-w-7xl mx-auto px-6 py-16">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-14">

        <div>

          <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

            Shinsei Diecast Admin

          </p>

          <h1 className="text-5xl font-bold mt-3">

            Admin Dashboard

          </h1>

          <p className="text-zinc-400 mt-4 text-lg">

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
border-pink-500
text-pink-400
hover:bg-gradient-to-r
hover:from-pink-500
hover:to-purple-600
hover:text-white
hover:border-transparent
transition-all
duration-300
"
          >

            Back to Store

          </button>

        </Link>

      </div>

      {/* Quick Overview */}

      <div className="grid md:grid-cols-3 gap-6 mb-12">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

          <p className="text-zinc-400">

            Products

          </p>

          <h2 className="text-3xl font-bold mt-2">

            Manage Catalog

          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 shadow-sm rounded-3xl p-6">

          <p className="text-zinc-400">

            Orders

          </p>

          <h2 className="text-3xl font-bold mt-2">

            Track Sales

          </h2>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 shadow-sm rounded-3xl p-6">

          <p className="text-zinc-400">

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
         bg-zinc-900
border
border-zinc-800
shadow-sm
          rounded-3xl
          p-8
          hover:border-pink-500/60
hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
          hover:-translate-y-2
          hover:shadow-[0_0_35px_rgba(236,72,153,.25)]
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
              bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
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

              <p className="text-zinc-400 mt-4 leading-relaxed">

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
     bg-zinc-900
border
border-zinc-800
shadow-sm
          rounded-3xl
          p-8
          hover:border-pink-500/60
hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
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
              bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
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

              <p className="text-zinc-400 mt-4 leading-relaxed">

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
          bg-zinc-900
border
border-zinc-800
shadow-sm
          rounded-3xl
          p-8
          hover:border-pink-500/60
hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
          hover:-translate-y-2
          hover:shadow-[0_0_35px_rgba(236,72,153,.25)]
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
              bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
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

              <p className="text-zinc-400 mt-4 leading-relaxed">

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
  bg-zinc-900
border
border-zinc-800
shadow-sm
  rounded-3xl
  p-8
  hover:border-pink-500/60
hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
  hover:-translate-y-2
  hover:shadow-[0_0_35px_rgba(236,72,153,.25)]
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
      bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
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
        text-zinc-400
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
  bg-zinc-900
border
border-zinc-800
shadow-sm
  rounded-3xl
  p-8
  hover:border-pink-500/60
hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
  hover:-translate-y-2
  hover:shadow-[0_0_35px_rgba(236,72,153,.25)]
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
     bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
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

      <p className="text-zinc-400 mt-4 leading-relaxed">
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
         bg-zinc-900
border
border-zinc-800
shadow-sm
          rounded-3xl
          p-8
          hover:border-pink-500/60
hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
          hover:-translate-y-2
          hover:shadow-[0_0_35px_rgba(236,72,153,.25)]
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
              bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
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

              <p className="text-zinc-400 mt-4 leading-relaxed">

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
          bg-zinc-900
border
border-zinc-800
shadow-sm
          rounded-3xl
          p-8
          hover:border-pink-500/60
hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
          hover:-translate-y-2
          hover:shadow-[0_0_35px_rgba(236,72,153,.25)]
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
             bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
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

              <p className="text-zinc-400 mt-4 leading-relaxed">

                Configure shipping, pickup and store settings.

              </p>

            </div>

          </div>

        </Link>
        {admin.role === "OWNER" && (

  <Link
    href="/admin/admins"
    className="
    group
    bg-zinc-900
    border
    border-zinc-800
    rounded-3xl
    p-8
    hover:border-pink-500/60
    hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
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
        bg-gradient-to-r
        from-pink-500
        via-fuchsia-500
        to-purple-600
        text-white
        flex
        items-center
        justify-center
        text-3xl
        "
      >
        👤
      </div>

      <div>

        <h2 className="text-3xl font-bold">
          Admin Management
        </h2>

        <p className="text-zinc-400 mt-4">
          Manage administrator access and permissions.
        </p>

      </div>

    </div>

  </Link>

)}
{admin.role === "OWNER" && (

  <Link
    href="/admin/bulk-import"
    className="
    group
    bg-zinc-900
    border
    border-zinc-800
    rounded-3xl
    p-8
    hover:border-pink-500/60
    hover:shadow-[0_0_30px_rgba(236,72,153,.25)]
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
        bg-gradient-to-r
        from-pink-500
        via-fuchsia-500
        to-purple-600
        text-white
        flex
        items-center
        justify-center
        text-3xl
        "
      >
        📦
      </div>

      <div>

        <h2 className="text-3xl font-bold">
          Bulk Import
        </h2>

        <p className="text-zinc-400 mt-4">
          Import hundreds of products using Excel and ZIP files.
        </p>

      </div>

    </div>

  </Link>

)}

      </div>

    </div>

  </main>

)

}