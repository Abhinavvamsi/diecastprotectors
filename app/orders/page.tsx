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

    <main className="min-h-screen bg-white text-black">

      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Heading */}
        <div className="flex items-center justify-between mb-12">

          <div>

            <p className="text-[#D4AF37] uppercase tracking-widest text-sm mb-3">
              Diecast Universe
            </p>

            <h1 className="text-5xl font-bold">

              My Orders

            </h1>

            <p className="text-gray-600 mt-4">

              View your order history and track your diecast collectibles.

            </p>

          </div>

          <Link href="/">

            <Button
              variant="outline"
              className="
              rounded-xl
              border-[#D4AF37]
              text-[#D4AF37]
              hover:bg-[#D4AF37]
              hover:text-black
              "
            >

              Continue Shopping

            </Button>

          </Link>

        </div>

        {/* Empty State */}
        {orders.length === 0 && (

          <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-12 text-center">

            <h2 className="text-3xl font-bold">

              No Orders Yet

            </h2>

            <p className="text-gray-600 mt-4">

              Your purchase history will appear here.

            </p>

          </div>

        )}

        {/* Orders */}
        <div className="space-y-8">

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-white border border-gray-200 shadow-sm rounded-3xl p-8"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

                {/* LEFT */}
                <div>

                  <p className="text-[#D4AF37] text-sm uppercase tracking-widest">

                    Order ID

                  </p>

                  <h2 className="text-3xl font-bold mt-2 break-all">

                    {order.orderId}

                  </h2>

                  <p className="text-[#D4AF37] mt-6">

                    Payment ID

                  </p>

                  <p className="break-all text-gray-700">

                    {order.paymentId}

                  </p>

                  <p className="text-[#D4AF37] mt-6">

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

                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100">

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

                        <p className="text-[#D4AF37] text-sm">

                          Quantity: {product.quantity}

                        </p>

                      </div>

                    </div>

                  ))}

                </div>

                {/* RIGHT */}
                <div className="md:text-right">

                  <p className="text-[#D4AF37]">

                    Total Amount

                  </p>

                  <h3 className="text-5xl font-bold mt-2">

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
                      bg-[#D4AF37]
                      text-black
                      hover:bg-[#B8941F]
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