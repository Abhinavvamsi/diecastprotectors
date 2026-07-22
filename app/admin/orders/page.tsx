import BulkStatusButton from "@/components/bulk-status-button"
import Image from "next/image"
import Link from "next/link"
import AdminNav from "@/components/admin-nav"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"

import OrderStatusSelect from "@/components/order-status-select"

import { requireAdmin } from "@/lib/admin"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
  search?: string
  status?: string
}>
}) {

  await requireAdmin()
  
  const {
  search = "",
  status = "All",
} = await searchParams
  
  const orders =
  await prisma.order.findMany({
    select: {
      id: true,
      orderId: true,
      userId: true,
      customer: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      pincode: true,
      products: true,
      totalAmount: true,
      paymentId: true,
      reservationId: true,
      createdAt: true,
      deliveryMethod: true,
      pickupLocation: true,
      status: true,
    },
    
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
const [
  pendingCount,
  packedCount,
  shippedCount,
  deliveredCount,
  cancelledCount,
  totalCount,
  deliveredOrders,
  pendingOrders,
  totalRevenue,
] = await Promise.all([

  prisma.order.count({
    where: {
      status: "Confirmed",
    },
  }),

  prisma.order.count({
    where: {
      status: "Packed",
    },
  }),

  prisma.order.count({
    where: {
      status: "Shipped",
    },
  }),

  prisma.order.count({
    where: {
      status: "Delivered",
    },
  }),

  prisma.order.count({
    where: {
      status: "Cancelled",
    },
  }),

  prisma.order.count(),

  prisma.order.count({
    where: {
      status: "Delivered",
    },
  }),

  prisma.order.count({
    where: {
      status: "Confirmed",
    },
  }),

  prisma.order.aggregate({
    where: {
      status: {
        not: "Cancelled",
      },
    },

    _sum: {
      totalAmount: true,
    },
  }),

])
  return (

    <main className="min-h-screen bg-[#09090B] text-white p-8">

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

  <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

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
font-bold
text-white
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
transition-all
duration-300
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
border-zinc-800
shadow-2xl
    border
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
border-zinc-800
shadow-2xl
    border
    rounded-3xl
    p-6
    "
  >

    <p className="text-zinc-400">

      Revenue

    </p>

    <h2 className="text-4xl font-bold mt-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

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
border-zinc-800
shadow-2xl
    border
    rounded-3xl
    p-6
    "
  >

    <p className="text-zinc-400">

      Confirmed

    </p>

    <h2 className="text-4xl font-bold mt-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

      {pendingOrders}

    </h2>

  </div>

  <div
    className="
    bg-zinc-900
border-zinc-800
shadow-2xl
    border
    rounded-3xl
    p-6
    "
  >

    <p className="text-zinc-400">

      Delivered

    </p>

    <h2 className="text-4xl font-bold mt-2 text-green">

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
    name: "Confirmed",
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

  <Link
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
        ? "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 border-transparent text-white text-white"
        : "border-zinc-700 text-zinc-400 hover:border-pink-500 hover:text-pink-400"
    }
  `}
>
  {item.name} ({item.count})
</Link>

))}

</div>
  <form
  className="mb-10"
  method="GET"
  
>
  <div className="mb-6">

  {status === "Confirmed" && (

    <BulkStatusButton
      currentStatus="Confirmed"
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
  placeholder="Search Order ID, Customer Name, Phone Number"
  className="
  w-full
  h-14
  rounded-2xl
  bg-zinc-900
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
  border
  px-5
  outline-none
  focus:ring-2
  transition-all
  "
/>

</form>

{orders.length === 0 && (

  <div
    className="
    bg-zinc-900
border-zinc-800
    border
    shadow-sm
    rounded-3xl
    p-10
    text-center
    "
  >

    <p className="text-zinc-400">
      No orders found
    </p>

  </div>

)}

<div className="space-y-8">

  {orders.map((order) => (

    <div
      key={order.id}
      className="
      bg-zinc-900
border-zinc-800
shadow-2xl
      border
      rounded-3xl
      p-8
      hover:shadow-md
      transition-all
      duration-300
      "
    >

      <div className="grid md:grid-cols-2 gap-6">

                {/* Customer Details */}
                <div>

                  <h2 className="text-2xl font-bold">

                    {order.customer}

                  </h2>

                  <p className="text-white mt-2">

                    {order.email}

                  </p>

                  <p className="text-white">

                    {order.phone}

                  </p>

                  <p className="text-white">

                    {order.address}

                  </p>

                  <p className="text-white">

                    {order.city}
                    {" - "}
                    {order.pincode}

                  </p>

                </div>

                {/* Order Details */}
                <div>

                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">

                    Total:
                    {" "}
                    ₹{order.totalAmount}

                  </p>

                  <p className="text-pink-400 mt-4">

                    Order ID

                    <br />

                    <span className="text-white break-all font-medium">
  {order.orderId}
</span>

                  </p>

                  <p className="text-pink-400 mt-2 break-all">

                    Payment ID

                    <br />

                    <span className="text-white break-all font-medium">
  {order.paymentId}
</span>

                  </p>

                  <p className="text-pink-400 mt-4">

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
                  <div className="mt-4">

  <p className="text-[#D4AF37]">

    Delivery Method

  </p>

  {order.deliveryMethod === "pickup" ? (

    <div
  className="
  inline-flex
  items-center
  mt-2
  px-4
  py-2
  rounded-full
  bg-pink-500/10
border-pink-500/30
text-pink-400
  border
  font-medium
  "
>
  📍 Pickup
  {order.pickupLocation &&
    ` - ${order.pickupLocation}`}
</div>
  ) : (

    <div
  className="
  inline-flex
  items-center
  mt-2
  px-4
  py-2
  rounded-full
  bg-purple-500/10
border-purple-500/30
text-purple-400
  border
  font-medium
  "
>
  🚚 Shipping
</div>

  )}

</div>

                  <div className="mt-6">

  <span
    className={`
      px-4
      py-2
      rounded-full
      text-sm
      font-semibold
      border

      ${
        order.status === "Confirmed"
          ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-400"

          : order.status === "Packed"
          ? "bg-blue-500/15 border-blue-500/30 text-blue-400"

          : order.status === "Shipped"
          ? "bg-purple-500/15 border-purple-500/30 text-purple-400"

          : order.status === "Delivered"
          ? "bg-green-500/15 border-green-500/30 text-green-400"

          : order.status === "Cancelled"
          ? "bg-red-500/15 border-red-500/30 text-red-400"

          : "bg-gray-50 border-gray-200 text-gray-700"
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

              <div className="mt-8 border-t border-zinc-800

shadow-sm pt-8">

                <h3 className="text-xl font-bold mb-6">

                  Ordered Items

                </h3>

                <div className="space-y-4">

                  {(order.products as any[])
                    .map(
                      (
                        product,
                        index
                      ) => {
                        const displayImage =
                          product.image ||
                          product.images?.[0] ||
                          ""
                        const displayPrice =
                          product.price ??
                          product.unitPrice ??
                          product.originalPrice ??
                          0
                        const isPreOrder = Boolean(
                          product.isPreOrder
                        )

                        return (

                        <div
                          key={index}
                          className="
                          flex
                          items-center
                          gap-4
                          bg-zinc-950
                          border-zinc-800
                          border

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
                                displayImage
                              }
                              alt={
                                product.name
                              }
                              fill
                              className="
                              object-contain
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

                            {isPreOrder && (
                              <span className="mt-2 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-100">
                                Pre Order
                              </span>
                            )}

                            <p className="text-pink-400">

                              Unit Price:
                              {" "}
                              ₹{displayPrice}

                            </p>

                          </div>

                          <div className="text-right">

                            <p className="font-bold text-lg">

                              ₹
                              {
                                displayPrice *
                                product.quantity
                              }

                            </p>

                          </div>

                        </div>

                        )
                      }
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
