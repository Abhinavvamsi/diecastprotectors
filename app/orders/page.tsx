import { prisma } from "@/lib/prisma"

import Navbar from "@/components/navbar"

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

    <main className="min-h-screen bg-black text-white">

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Heading */}
        <div className="flex items-center justify-between mb-12">

          <div>

            <h1 className="text-5xl font-bold">

              My Orders

            </h1>

            <p className="text-red-500 mt-4">

              Track and manage your purchases.

            </p>

          </div>

          <Link href="/">

            <Button
              variant="outline"
              className="rounded-xl"
            >

              Continue Shopping

            </Button>

          </Link>

        </div>

        {/* Empty State */}
        {orders.length === 0 && (

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">

            <h2 className="text-3xl font-bold">

              No Orders Yet

            </h2>

            <p className="text-red-500 mt-4">

              Your purchase history will appear here.

            </p>

          </div>

        )}

        {/* Orders */}
        <div className="space-y-8">

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

                {/* LEFT */}
                <div>

                  <p className="text-red-500 text-sm uppercase tracking-widest">

                    Order ID

                  </p>

                  <h2 className="text-3xl font-bold mt-2 break-all">

                    {order.orderId}

                  </h2>

                  <p className="text-red-500 mt-6">

                    Payment ID

                  </p>

                  <p className="break-all">

                    {order.paymentId}

                  </p>

                  <p className="text-red-500 mt-6">

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
      className="flex items-center gap-4"
    >

      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black">

        <img
          src={
  product.images?.[0] ||
  product.image
}
          alt={product.name}
          className="w-full h-full object-contain"
        />

      </div>

      <div>

        <h3 className="font-semibold">

          {product.name}

        </h3>

        <p className="text-red-500 text-sm">

          Quantity:
          {" "}
          {product.quantity}

        </p>

      </div>

    </div>

  ))}

</div>
                {/* RIGHT */}
                <div className="md:text-right">

                  <p className="text-red-500">

                    Total Amount

                  </p>

                  <h3 className="text-5xl font-bold mt-2">

                    ₹{order.totalAmount}

                  </h3>

                  <div className="mt-8">

                    <span
                      className={`px-5 py-3 rounded-full text-sm font-semibold ${
                        order.status === "Pending"
                          ? "bg-yellow-500/20 text-yellow-400"

                          : order.status === "Packed"
                          ? "bg-blue-500/20 text-blue-400"

                          : order.status === "Shipped"
                          ? "bg-purple-500/20 text-purple-400"

                          : order.status === "Delivered"
                          ? "bg-green-500/20 text-green-400"

                          : "bg-zinc-700 text-white"
                      }`}
                    >

                      {order.status}

                    </span>

                  </div>

                  <Link
                    href={`/track-order`}
                  >

                    <Button
                      className="mt-8 rounded-xl"
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

    </main>

  )

}