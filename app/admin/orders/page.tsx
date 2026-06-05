export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import OrderStatusSelect from "@/components/order-status-select"
import { toast } from "sonner"

import {
  currentUser,
} from "@clerk/nextjs/server"

import { redirect } from "next/navigation"

export default async function OrdersPage() {

  const user = await currentUser()

  const isAdmin =
    user?.primaryEmailAddress
      ?.emailAddress ===
    "abhinavvamsi2004@gmail.com"

  if (!isAdmin) {

    redirect("/")

  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold mb-12">
          Orders Dashboard
        </h1>

        <div className="space-y-8">

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8"
            >

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <h2 className="text-2xl font-bold">
                    {order.customer}
                  </h2>

                  <p className="text-zinc-400 mt-2">
                    {order.email}
                  </p>

                  <p className="text-zinc-400">
                    {order.phone}
                  </p>

                  <p className="text-zinc-400">
                    {order.address}
                  </p>

                  <p className="text-zinc-400">
                    {order.city} - {order.pincode}
                  </p>

                </div>

                <div>

                  <p className="text-xl font-bold">
                    ₹{order.totalAmount}
                  </p>
                  <p className="text-red-500 mt-4">

  Order ID:
  <br />

  <span className="text-white break-all">

    {order.orderId}

  </span>

</p>
                  <p className="text-red-500 mt-2 break-all">
                    Payment ID:
                    <br />
                    {order.paymentId}
                  </p>

                  <p className="text-red-500 mt-4">
                    Ordered On:
                    <br />
                    {new Date(
  order.createdAt
).toLocaleString(
  "en-IN",
  {
    timeZone:
      "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
)}
                  </p>

                  <div className="mt-6">

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        order.status === "Pending"
                          ? "bg-yellow-500/20 text-yellow-400"

                          : order.status === "Packed"
                          ? "bg-blue-500/20 text-blue-400"

                          : order.status === "Shipped"
                          ? "bg-purple-500/20 text-purple-400"

                          : order.status === "Delivered"
                          ? "bg-green-500/20 text-green-400"

                          : order.status === "Cancelled"
                          ? "bg-red-500/20 text-red-400"
                          
                          : "bg-zinc-700 text-white"
                      }`}
                    >

                      {order.status}

                    </span>

                  </div>

                  <OrderStatusSelect
                    orderId={order.id}
                    currentStatus={order.status}
                  />

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  )
}