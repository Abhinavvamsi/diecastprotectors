import { prisma } from "@/lib/prisma"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

import Link from "next/link"

import { Button } from "@/components/ui/button"

import {
  currentUser,
} from "@clerk/nextjs/server"

import { redirect }
from "next/navigation"

export default async function OrdersPage() {

  const user =
    await currentUser()

  if (!user) {

    redirect("/sign-in")

  }

  const orders =
    await prisma.order.findMany({

      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

    })

  return (

    <main className="min-h-screen bg-[#09090B] text-white">

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Heading */}
        <div className="flex items-center justify-between mb-12">

          <div>

            <p className="uppercase tracking-widest text-sm mb-3 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
              Shinsei Diecast
            </p>

            <h1 className="text-5xl font-bold">

              My Orders

            </h1>

            <p className="text-zinc-400 mt-4">

              View your order history and track your diecast collectibles.

            </p>

          </div>

          <Link href="/">

            <Button
              variant="outline"
              className="
              rounded-xl
             border-pink-500
text-pink-400
hover:bg-pink-500
hover:text-white
              "
            >

              Continue Shopping

            </Button>

          </Link>

        </div>

        {/* Empty State */}
        {orders.length === 0 && (

          <div className="bg-zinc-900 border border-zinc-800 shadow-xl rounded-3xl p-12 text-center">

            <h2 className="text-3xl font-bold">

              No Orders Yet

            </h2>

            <p className="text-zinc-400 mt-4">

              Your purchase history will appear here.

            </p>

          </div>

        )}

        {/* Orders */}
        <div className="space-y-8">

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 shadow-xl rounded-3xl p-8"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

                {/* LEFT */}
                <div>

                  <p className="bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-500
bg-clip-text
text-transparent text-sm uppercase tracking-widest">

                    Order ID

                  </p>

                  <h2 className="text-3xl font-bold mt-2 break-all">

                    {order.orderId}

                  </h2>

                  <p className="text-pink-400 mt-6">

                    Payment ID

                  </p>

                  <p className="break-all text-zinc-400">

                    {order.paymentId}

                  </p>

                  <p className="text-pink-400 mt-6">

                    Ordered On

                  </p>

                  <p>

                    {new Date(
                      order.createdAt
                    ).toLocaleString()}

                  </p>

                </div>

                {/* PRODUCTS */}
                <div className="space-y-4">

                  {(order.products as any[])
                    .map((product, index) => (

                    <div
  key={index}
  className="
  flex
  items-start
  gap-4
  min-h-[80px]
  "
>

                   <div
  className="
  relative
  w-16
  h-16
  shrink-0
  rounded-xl
  overflow-hidden
  bg-zinc-950
  border
  border-zinc-800
  flex
  items-center
  justify-center
  "
>

  <img
    src={
      product.images?.[0] ||
      product.image
    }
    alt={product.name}
    className="
    w-full
    h-full
    object-contain
    p-1
    "
  />

</div>

                      <div>

                       <h3
  className="
  font-semibold
  text-white
  line-clamp-2
  min-h-[48px]
  "
>
  {product.name}
</h3>

                        <p className="text-pink-400 text-sm mt-1">
  Quantity: {product.quantity}
</p>

                      </div>

                    </div>

                  ))}

                </div>

                {/* RIGHT */}
                <div className="md:text-right">

                  <p className="text-pink-400">

                    Total Amount

                  </p>

                  <h3 className="
text-5xl
font-bold
mt-2
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-500
bg-clip-text
text-transparent
">

                    ₹{order.totalAmount}

                  </h3>

                  <div className="mt-8">

                    <span
                      className={`px-5 py-3 rounded-full text-sm font-semibold border ${
                        order.status === "Pending"
                          ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"

                          : order.status === "Packed"
                          ? "bg-blue-500/20 text-blue-600 border-blue-500/30"

                          : order.status === "Shipped"
                          ? "bg-purple-500/20 text-purple-600 border-purple-500/30"

                          : order.status === "Delivered"
                          ? "bg-green-500/20 text-green-600 border-green-500/30"

                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >

                      {order.status}

                    </span>

                  </div>

                  <Link
                    href={`/track-order`}
                  >

                    <Button
                      className="
                      mt-8
                      rounded-xl
                     bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
hover:scale-105
hover:shadow-[0_0_30px_rgba(236,72,153,.4)]
transition-all
duration-300
                      "
                    >

                      Track Order

                    </Button>

                  </Link>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      <Footer />

    </main>

  )

}