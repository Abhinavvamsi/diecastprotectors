import BulkStatusButton from "@/components/bulk-status-button"
import Image from "next/image"
import Link from "next/link"
import AdminNav from "@/components/admin-nav"
import AdminOrdersSearch from "@/components/admin-orders-search"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"

import OrderStatusSelect from "@/components/order-status-select"

import { requireAdmin } from "@/lib/admin"
import { calculateShippingCharge } from "@/lib/shipping"
import { getOrderItemPricing } from "@/lib/preorder"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
  search?: string
  status?: string
  productId?: string
  preorderFilter?: string
}>
}) {

  await requireAdmin()
  
  const {
  search = "",
  status = "All",
  productId = "",
  preorderFilter = "All",
} = await searchParams
  const normalizedPreorderFilter =
    preorderFilter === "Pre Order"
      ? "Pre-Orders"
      : preorderFilter

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

  const uniqueOrders = Array.from(
    orders
      .reduce((orderMap, order: any) => {
        const duplicateKey =
          order.reservationId ||
          order.paymentId ||
          order.orderId ||
          order.id

        if (!orderMap.has(duplicateKey)) {
          orderMap.set(duplicateKey, order)
        }

        return orderMap
      }, new Map<string, any>())
      .values()
  )
	
  const allProductIds = Array.from(
    new Set(
      uniqueOrders.flatMap((order: any) =>
        (order.products as any[]).map(
          (product) => product.id
        )
      )
    )
  )

  const allProducts = allProductIds.length
    ? await prisma.product.findMany({
        where: {
          id: {
            in: allProductIds,
          },
        },
      })
    : []

  const productMap = new Map(
    allProducts.map((product) => [
      product.id,
      product,
    ])
  )

  const orderHasPreOrderItem = (order: any) =>
    (order.products as any[]).some((item) => {
      const fallbackProduct = productMap.get(item.id)
      return Boolean(item.isPreOrder) || Boolean(fallbackProduct?.isPreOrder)
    })

  const normalizedSearch = search.trim().toLowerCase()

	  const productFilteredOrders = productId
	    ? uniqueOrders.filter((order: any) =>
	        (order.products as any[]).some(
	          (item) => item.id === productId
	        )
	      )
	    : uniqueOrders

  const filteredOrders =
    normalizedPreorderFilter === "Pre-Orders"
      ? productFilteredOrders.filter(orderHasPreOrderItem)
      : normalizedPreorderFilter === "Regular"
      ? productFilteredOrders.filter(
          (order: any) => !orderHasPreOrderItem(order)
        )
      : productFilteredOrders
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
  href={`?search=${search}&status=${item.name}${productId ? `&productId=${productId}` : ""}${preorderFilter !== "All" ? `&preorderFilter=${preorderFilter}` : ""}`}
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

<div className="mb-6">
  <div className="mb-3 text-sm uppercase tracking-[0.25em] text-zinc-500">
    Order Type
  </div>
  <div className="flex flex-wrap gap-3">
    {[
      { name: "All", count: productFilteredOrders.length },
      {
        name: "Pre-Orders",
        count: productFilteredOrders.filter(orderHasPreOrderItem).length,
      },
      {
        name: "Regular",
        count: productFilteredOrders.filter(
          (order: any) => !orderHasPreOrderItem(order)
        ).length,
      },
    ].map((item) => (
      <Link
        key={item.name}
        href={`?search=${search}&status=${status}${productId ? `&productId=${productId}` : ""}&preorderFilter=${item.name}`}
        className={`
          px-5 py-2 rounded-full border transition-all flex items-center gap-2
          ${
            normalizedPreorderFilter === item.name
              ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 border-transparent text-white"
              : "border-zinc-700 text-zinc-400 hover:border-cyan-500 hover:text-cyan-400"
          }
        `}
      >
        {item.name} ({item.count})
      </Link>
    ))}
  </div>
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
  type="hidden"
  name="productId"
  value={productId}
/>

<input
  type="hidden"
  name="preorderFilter"
  value={preorderFilter}
/>

<AdminOrdersSearch initialSearch={search} />

</form>

<div
  data-admin-orders-empty
  style={{
    display: filteredOrders.length === 0 ? "" : "none",
  }}
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

<div className="space-y-8">

          {filteredOrders.map((order) => (

    <div
      key={order.id}
      data-admin-order-card
      data-order-search={[
        order.orderId,
        order.customer,
        order.email,
        order.phone,
        order.address,
        order.city,
        order.pincode,
        ...(order.products as any[]).flatMap((item) => {
          const fallbackProduct = productMap.get(item.id)
          return [
            item.name,
            item.model,
            item.productName,
            fallbackProduct?.name,
          ]
        }),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()}
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
          ? "bg-green-500/15 border-green-500/30 text-green-400"

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

                  <div className="mt-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                      Price Breakdown
                    </p>
                    {(() => {
                      const orderItems = order.products as any[]
                      const itemBreakdowns = orderItems.map((item) => {
                        const fallbackProduct = productMap.get(item.id)
                        return {
                          item,
                          pricing: getOrderItemPricing(
                            item,
                            fallbackProduct
                          ),
                        }
                      })
                      const readyStockItemCount =
                        itemBreakdowns.reduce(
                          (sum, { item, pricing }) =>
                            pricing.isPreOrder
                              ? sum
                              : sum +
                                Number(
                                  item.quantity || 0
                                ),
                          0
                        )
                      const hasOnlyPreOrderItems =
                        orderItems.length > 0 &&
                        orderItems.every((item) => {
                          const fallbackProduct =
                            productMap.get(item.id)
                          return (
                            Boolean(item.isPreOrder) ||
                            Boolean(fallbackProduct?.isPreOrder)
                          )
                        })
                      const itemsSubtotal = itemBreakdowns.reduce(
                        (sum, { pricing }) =>
                          sum + pricing.lineOriginalPrice,
                        0
                      )
                      const payableSubtotal = itemBreakdowns.reduce(
                        (sum, { pricing }) =>
                          sum + pricing.linePayablePrice,
                        0
                      )
                      const readyStockPayableSubtotal =
                        itemBreakdowns.reduce(
                          (sum, { pricing }) =>
                            pricing.isPreOrder
                              ? sum
                              : sum +
                                pricing.linePayablePrice,
                          0
                        )
                      const remainingLaterTotal =
                        itemBreakdowns.reduce(
                          (sum, { pricing }) =>
                            sum + pricing.lineRemainingPrice,
                          0
                        )
                      const shippingCharge =
                        calculateShippingCharge({
                          subtotal:
                            readyStockPayableSubtotal,
                          itemCount:
                            readyStockItemCount,
                          deliveryMethod: order.deliveryMethod,
                          hasOnlyPreOrderItems,
                        })
                      const couponDiscount = Math.max(
                        0,
                        itemsSubtotal +
                          shippingCharge -
                          remainingLaterTotal -
                          Number(order.totalAmount || 0)
                      )
                      const showCouponDiscount =
                        couponDiscount > 0

                      return (
                        <div className="mt-4 space-y-2 text-sm text-zinc-200">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Items Payable Now</span>
                            <span>₹{itemsSubtotal}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Shipping</span>
                            <span>₹{shippingCharge}</span>
                          </div>
                          {showCouponDiscount && (
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Coupon Discount</span>
                              <span>-₹{couponDiscount}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between border-t border-cyan-500/20 pt-2 font-semibold text-cyan-100">
                            <span>Total Paid</span>
                            <span>₹{order.totalAmount}</span>
                          </div>
                          {remainingLaterTotal > 0 && (
                            <div className="flex items-center justify-between text-cyan-200/80">
                              <span>Balance Due on Arrival</span>
                              <span>₹{remainingLaterTotal}</span>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>

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
                        const fallbackProduct =
                          productMap.get(product.id)
                        const pricing = getOrderItemPricing(
                          product,
                          fallbackProduct
                        )
                        const displayImage =
                          product.image ||
                          product.images?.[0] ||
                          (fallbackProduct as any)?.images?.[0] ||
                          (fallbackProduct as any)?.image ||
                          ""
                        const displayPrice =
                          product.price ??
                          product.unitPrice ??
                          product.originalPrice ??
                          fallbackProduct?.price ??
                          0
                        const isPreOrder =
                          Boolean(product.isPreOrder) ||
                          Boolean(fallbackProduct?.isPreOrder)
                        const expectedArrival =
                          product.expectedArrival ||
                          fallbackProduct?.expectedArrival

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
                                Pre-Order
                              </span>
                            )}

                            {isPreOrder && expectedArrival && (
                              <p className="mt-2 text-xs text-cyan-300">
                                Arrives {expectedArrival}
                              </p>
                            )}

                            {isPreOrder ? (
                              <div className="mt-2 inline-flex flex-col rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-cyan-100">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Pre-Order</span>
                                <span className="text-xs mt-1">Original amount: ₹{pricing.lineOriginalPrice}</span>
                                <span className="text-xs">Deposit paid: ₹{pricing.linePayablePrice}</span>
                                <span className="text-xs">Balance due on arrival: ₹{pricing.lineRemainingPrice}</span>
                              </div>
                            ) : (
                              <p className="text-pink-400">
                                Unit Price: ₹{displayPrice}
                              </p>
                            )}

                          </div>

                          <div className="text-right">

                            <p className="font-bold text-lg">

                              ₹
                              {
                                isPreOrder
                                  ? pricing.linePayablePrice
                                  : displayPrice * product.quantity
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
