import BulkStatusButton from "@/components/bulk-status-button"
import Image from "next/image"
import AdminNav from "@/components/admin-nav"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"

import OrderStatusSelect from "@/components/order-status-select"

import {
  currentUser,
} from "@clerk/nextjs/server"

import { redirect } from "next/navigation"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
  search?: string
  status?: string
}>
}) {

  const user =
    await currentUser()
    

  const isAdmin =
    user?.primaryEmailAddress
      ?.emailAddress ===
    "abhinavvamsi2004@gmail.com"

  if (!isAdmin) {

    redirect("/")

  }
  const {
  search = "",
  status = "All",
} = await searchParams
  
  const orders =
  await prisma.order.findMany({
    
where: {

  ...(search
    ? {
        OR: [

          {
            orderId: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            customer: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            phone: {
              contains: search,
            },
          },

        ],
      }
    : {}),

  ...(status !== "All"
    ? {
        status,
      }
    : {}),

},

    orderBy: {
      createdAt: "desc",
    },

  })
const pendingCount =
  await prisma.order.count({

    where: {
      status: "Pending",
    },

  })

const packedCount =
  await prisma.order.count({

    where: {
      status: "Packed",
    },

  })

const shippedCount =
  await prisma.order.count({

    where: {
      status: "Shipped",
    },

  })

const deliveredCount =
  await prisma.order.count({

    where: {
      status: "Delivered",
    },

  })

const cancelledCount =
  await prisma.order.count({

    where: {
      status: "Cancelled",
    },

  })

const totalCount =
  await prisma.order.count()
  const totalRevenue =
  await prisma.order.aggregate({

    where: {

      status: {
        not: "Cancelled",
      },

    },

    _sum: {

      totalAmount: true,

    },

  })
const deliveredOrders =
  await prisma.order.count({

    where: {
      status: "Delivered",
    },

  })

const pendingOrders =
  await prisma.order.count({

    where: {
      status: "Pending",
    },

  })
  return (

    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-7xl mx-auto">

  <AdminNav />

  <div
  className="
  flex
  justify-between
  items-center
  mb-12
  "
>

  <h1 className="text-5xl font-bold">

    Orders Dashboard

  </h1>

  <a
    href="/api/export-orders"
  >

    <button
      className="
      px-6
      py-3
      rounded-xl
      bg-green-500
      hover:bg-green-600
      font-bold
      "
    >

      📥 Export Excel

    </button>

  </a>

</div>
  <div
  className="
  grid
  grid-cols-1
  md:grid-cols-4
  gap-6
  mb-10
  "
>

  <div
    className="
    bg-zinc-900
    border
    border-zinc-800
    rounded-3xl
    p-6
    "
  >

    <p className="text-zinc-400">

      Total Orders

    </p>

    <h2 className="text-4xl font-bold mt-2">

      {totalCount}

    </h2>

  </div>

  <div
    className="
    bg-zinc-900
    border
    border-zinc-800
    rounded-3xl
    p-6
    "
  >

    <p className="text-zinc-400">

      Revenue

    </p>

    <h2 className="text-4xl font-bold mt-2 text-green-500">

      ₹
      {
        totalRevenue._sum
          .totalAmount || 0
      }

    </h2>

  </div>

  <div
    className="
    bg-zinc-900
    border
    border-zinc-800
    rounded-3xl
    p-6
    "
  >

    <p className="text-zinc-400">

      Pending

    </p>

    <h2 className="text-4xl font-bold mt-2 text-yellow-500">

      {pendingOrders}

    </h2>

  </div>

  <div
    className="
    bg-zinc-900
    border
    border-zinc-800
    rounded-3xl
    p-6
    "
  >

    <p className="text-zinc-400">

      Delivered

    </p>

    <h2 className="text-4xl font-bold mt-2 text-green-500">

      {deliveredOrders}

    </h2>

  </div>

</div>
  <div className="flex flex-wrap gap-3 mb-6">

  {[
  {
    name: "All",
    count: totalCount,
  },

  {
    name: "Pending",
    count: pendingCount,
  },

  {
    name: "Packed",
    count: packedCount,
  },

  {
    name: "Shipped",
    count: shippedCount,
  },

  {
    name: "Delivered",
    count: deliveredCount,
  },

  {
    name: "Cancelled",
    count: cancelledCount,
  },

].map((item) => (

  <a
  key={item.name}
  href={`?search=${search}&status=${item.name}`}
  className={`
    px-5
    py-2
    rounded-full
    border
    transition-all
    flex
    items-center
    gap-2

      ${
        status === item.name

          ? "bg-red-500 border-red-500 text-white"

          : "border-zinc-700 text-zinc-400 hover:border-red-500"
      }
    `}
  >

    {item.name}
    {" "}
    (
    {item.count}
    )

  </a>

))}

</div>
  <form
  className="mb-10"
  method="GET"
  
>
  <div className="mb-6">

  {status === "Pending" && (

    <BulkStatusButton
      currentStatus="Pending"
      newStatus="Packed"
      label={`Mark All ${pendingCount} Orders as Packed`}
    />

  )}

  {status === "Packed" && (

    <BulkStatusButton
      currentStatus="Packed"
      newStatus="Shipped"
      label={`Mark All ${packedCount} Orders as Shipped`}
    />

  )}

  {status === "Shipped" && (

    <BulkStatusButton
      currentStatus="Shipped"
      newStatus="Delivered"
      label={`Mark All ${shippedCount} Orders as Delivered`}
    />

  )}

</div>
<input
  type="hidden"
  name="status"
  value={status}
/>
  <input
    type="text"
    name="search"
    defaultValue={search}
    placeholder="
    Search Order ID,
    Customer Name,
    Phone Number
    "
    className="
    w-full
    h-14
    rounded-2xl
    bg-zinc-900
    border
    border-zinc-800
    px-5
    text-white
    "
  />

</form>

{orders.length === 0 && (

  <div
    className="
    bg-zinc-900
    border
    border-zinc-800
    rounded-3xl
    p-10
    text-center
    "
  >

    No orders found

  </div>

)}
        <div className="space-y-8">

          {orders.map((order) => (

            <div
  key={order.id}
  className="
  bg-zinc-900
  border
  border-zinc-800
  rounded-3xl
  p-8
  "
>


              <div className="grid md:grid-cols-2 gap-6">

                {/* Customer Details */}
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

                    {order.city}
                    {" - "}
                    {order.pincode}

                  </p>

                </div>

                {/* Order Details */}
                <div>

                  <p className="text-2xl font-bold text-green-500">

                    Total:
                    {" "}
                    ₹{order.totalAmount}

                  </p>

                  <p className="text-red-500 mt-4">

                    Order ID

                    <br />

                    <span className="text-white break-all">

                      {order.orderId}

                    </span>

                  </p>

                  <p className="text-red-500 mt-2 break-all">

                    Payment ID

                    <br />

                    <span className="text-white">

                      {order.paymentId}

                    </span>

                  </p>

                  <p className="text-red-500 mt-4">

                    Ordered On

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
                      className={`
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-semibold

                        ${
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
                        }
                      `}
                    >

                      {order.status}

                    </span>

                  </div>

                  <OrderStatusSelect
                    orderId={order.id}
                    currentStatus={
                      order.status
                    }
                  />

                </div>

              </div>

              {/* Ordered Products */}

              <div className="mt-8 border-t border-zinc-800 pt-8">

                <h3 className="text-xl font-bold mb-6">

                  Ordered Items

                </h3>

                <div className="space-y-4">

                  {(order.products as any[])
                    .map(
                      (
                        product,
                        index
                      ) => (

                        <div
                          key={index}
                          className="
                          flex
                          items-center
                          gap-4
                          bg-black
                          border
                          border-zinc-800
                          rounded-2xl
                          p-4
                          "
                        >

                          <div
                            className="
                            relative
                            w-20
                            h-20
                            rounded-xl
                            overflow-hidden
                            shrink-0
                            "
                          >

                            <Image
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              fill
                              className="
                              object-cover
                              "
                            />

                          </div>

                          <div className="flex-1">

                            <h4 className="font-bold text-lg">

                              {product.name}

                            </h4>

                            <p className="text-zinc-400">

                              Quantity:
                              {" "}
                              {product.quantity}

                            </p>

                            <p className="text-green-500">

                              Unit Price:
                              {" "}
                              ₹{product.price}

                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-bold text-lg">

                              ₹
                              {
                                product.price *
                                product.quantity
                              }

                            </p>

                          </div>

                        </div>

                      )
                    )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>

  )

}