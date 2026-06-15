import BulkStatusButton from "@/components/bulk-status-button"
import Image from "next/image"
import Link from "next/link"
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
      status: "Pending",
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
      status: "Pending",
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

    <main className="min-h-screen bg-white text-black p-8">

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
      bg-[#D4AF37]
text-black
      hover:bg-[#B8941F]
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
    bg-white
    border
    border-gray-200
    shadow-sm
    rounded-3xl
    p-6
    "
  >

    <p className="text-gray-600">

      Total Orders

    </p>

    <h2 className="text-4xl font-bold mt-2">

      {totalCount}

    </h2>

  </div>

  <div
    className="
    bg-white
    border
    border-gray-200

shadow-sm
    rounded-3xl
    p-6
    "
  >

    <p className="text-gray-600">

      Revenue

    </p>

    <h2 className="text-4xl font-bold mt-2 text-[#D4AF37]">

      ₹
      {
        totalRevenue._sum
          .totalAmount || 0
      }

    </h2>

  </div>

  <div
    className="
    bg-white
    border
    border-gray-200

shadow-sm
    rounded-3xl
    p-6
    "
  >

    <p className="text-gray-600">

      Pending

    </p>

    <h2 className="text-4xl font-bold mt-2 text-yellow-500">

      {pendingOrders}

    </h2>

  </div>

  <div
    className="
    bg-white
    border
    border-gray-200

shadow-sm
    rounded-3xl
    p-6
    "
  >

    <p className="text-gray-600">

      Delivered

    </p>

    <h2 className="text-4xl font-bold mt-2 text-[#D4AF37]">

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
        ? "bg-[#D4AF37] border-[#D4AF37] text-black text-white"
        : "border-gray-300 text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]"
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
  placeholder="Search Order ID, Customer Name, Phone Number"
  className="
  w-full
  h-14
  rounded-2xl
  bg-white
  border
  border-gray-300
  shadow-sm
  px-5
  text-black
  placeholder:text-gray-400
  outline-none
  focus:border-[#D4AF37]
  focus:ring-2
  focus:ring-[#D4AF37]/20
  transition-all
  "
/>

</form>

{orders.length === 0 && (

  <div
    className="
    bg-white
    border
    border-gray-200
    shadow-sm
    rounded-3xl
    p-10
    text-center
    "
  >

    <p className="text-gray-500">
      No orders found
    </p>

  </div>

)}

<div className="space-y-8">

  {orders.map((order) => (

    <div
      key={order.id}
      className="
      bg-white
      border
      border-gray-200
      shadow-sm
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

                  <p className="text-gray-600 mt-2">

                    {order.email}

                  </p>

                  <p className="text-gray-600">

                    {order.phone}

                  </p>

                  <p className="text-gray-600">

                    {order.address}

                  </p>

                  <p className="text-gray-600">

                    {order.city}
                    {" - "}
                    {order.pincode}

                  </p>

                </div>

                {/* Order Details */}
                <div>

                  <p className="text-2xl font-bold text-[#D4AF37]">

                    Total:
                    {" "}
                    ₹{order.totalAmount}

                  </p>

                  <p className="text-[#D4AF37] mt-4">

                    Order ID

                    <br />

                    <span className="text-black break-all font-medium">
  {order.orderId}
</span>

                  </p>

                  <p className="text-[#D4AF37] mt-2 break-all">

                    Payment ID

                    <br />

                    <span className="text-black break-all font-medium">
  {order.paymentId}
</span>

                  </p>

                  <p className="text-[#D4AF37] mt-4">

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
  bg-[#FFF8E1]
  border
  border-[#D4AF37]/40
  text-[#B8941F]
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
  bg-blue-50
  border
  border-blue-200
  text-blue-700
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
        order.status === "Pending"
          ? "bg-yellow-50 border-yellow-200 text-yellow-700"

          : order.status === "Packed"
          ? "bg-blue-50 border-blue-200 text-blue-700"

          : order.status === "Shipped"
          ? "bg-purple-50 border-purple-200 text-purple-700"

          : order.status === "Delivered"
          ? "bg-green-50 border-green-200 text-green-700"

          : order.status === "Cancelled"
          ? "bg-red-50 border-red-200 text-red-700"

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

              <div className="mt-8 border-t border-gray-200

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
                      ) => (

                        <div
                          key={index}
                          className="
                          flex
                          items-center
                          gap-4
                          bg-gray-50
                          border
                          border-gray-200

shadow-sm
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
                              object-contain
                              "
                            />

                          </div>

                          <div className="flex-1">

                            <h4 className="font-bold text-lg">

                              {product.name}

                            </h4>

                            <p className="text-gray-600">

                              Quantity:
                              {" "}
                              {product.quantity}

                            </p>

                            <p className="text-[#D4AF37]">

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