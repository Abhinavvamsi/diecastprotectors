export const dynamic = "force-dynamic"

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
import { getOrderItemPricing } from "@/lib/preorder"
import PayPreOrderBalanceButton from "@/components/pay-preorder-balance-button"
import PayPreOrderShippingButton from "@/components/pay-preorder-shipping-button"
import PayMergedPreOrderShippingButton from "@/components/pay-merged-preorder-shipping-button"
import {
  getMergedPreOrderShippingBatch,
  getPreOrderShippingBatch,
} from "@/lib/preorder-shipping"

function formatOrderTime(
  value: Date
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }
  ).format(value)
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{
    filter?: string | string[] | undefined
  }>
}) {

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

  const productIds = Array.from(
    new Set(
      orders.flatMap((order) =>
        (order.products as any[]).map(
          (product) => product.id
        )
      )
    )
  )

  const products = productIds.length
    ? await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      })
    : []

	  const productMap = new Map(
	    products.map((product) => [
	      product.id,
	      product,
	    ])
	  )

  const uniqueOrders = Array.from(
    orders
      .reduce((orderMap, order) => {
        const duplicateKey =
          order.reservationId ||
          order.paymentId ||
          order.orderId ||
          order.id

        if (!orderMap.has(duplicateKey)) {
          orderMap.set(duplicateKey, order)
        }

        return orderMap
      }, new Map<string, typeof orders[number]>())
      .values()
  )

  const params = searchParams
    ? await searchParams
    : {}
  const activeFilter =
    typeof params.filter === "string"
      ? params.filter
      : "all"

  const orderPaymentStatus = new Map<
    string,
    {
      paymentDue: number
      shippingDue: number
      waitingForArrival: number
    }
  >()

  for (const order of uniqueOrders) {
    const orderProducts = order.products as any[]
    const paymentDue =
      orderProducts.reduce((total, item) => {
        const pricing = getOrderItemPricing(item)

        if (
          !pricing.isPreOrder ||
          !item.preOrderArrived ||
          item.preOrderBalancePaid
        ) {
          return total
        }

        return total + pricing.lineRemainingPrice
      }, 0)
    const shippingBatch = getPreOrderShippingBatch(
      orderProducts,
      order.deliveryMethod
    )
    const waitingForArrival =
      orderProducts.filter((item) => {
        const pricing = getOrderItemPricing(item)

        return (
          pricing.isPreOrder &&
          !item.preOrderArrived &&
          !item.preOrderBalancePaid
        )
      }).length

    orderPaymentStatus.set(order.id, {
      paymentDue,
      shippingDue: shippingBatch.shippingAmount,
      waitingForArrival,
    })
  }

  const paymentDueCount =
    uniqueOrders.filter((order) => {
      const status = orderPaymentStatus.get(order.id)

      return Boolean(
        status &&
          (status.paymentDue > 0 || status.shippingDue > 0)
          )
    }).length

  const ordersWithShippingDue =
    uniqueOrders.filter((order) => {
      const status = orderPaymentStatus.get(order.id)

      return Boolean(status && status.shippingDue > 0)
    })

  const mergedShippingBatch =
    getMergedPreOrderShippingBatch(
      ordersWithShippingDue.map((order) => ({
        id: order.id,
        orderId: order.orderId,
        products: Array.isArray(order.products)
          ? (order.products as any[])
          : [],
        deliveryMethod: order.deliveryMethod,
      }))
    )

  const canMergePreOrderShipping =
    ordersWithShippingDue.length > 1 &&
    mergedShippingBatch.itemCount > 0 &&
    mergedShippingBatch.shippingAmount > 0

  const filteredOrders =
    activeFilter === "payment-due"
      ? uniqueOrders.filter((order) => {
          const status = orderPaymentStatus.get(order.id)

          return Boolean(
            status &&
              (status.paymentDue > 0 || status.shippingDue > 0)
          )
        })
      : uniqueOrders
	
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

              Order History

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
	        {uniqueOrders.length === 0 && (

          <div className="bg-zinc-900 border border-zinc-800 shadow-xl rounded-3xl p-12 text-center">

            <h2 className="text-3xl font-bold">

              No Orders Yet

            </h2>

            <p className="text-zinc-400 mt-4">

              Your purchase history will appear here.

            </p>

          </div>

        )}

        {uniqueOrders.length > 0 && (
          <div className="mb-8 space-y-5">
            {paymentDueCount > 0 && (
              <div className="
                animate-pulse
                rounded-3xl
                border
                border-orange-400/40
                bg-orange-500/10
                p-5
                shadow-[0_0_35px_rgba(251,146,60,.18)]
              ">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-300">
                  Payment Action Required
                </p>
                <p className="mt-2 text-zinc-200">
                  {paymentDueCount} order{paymentDueCount === 1 ? "" : "s"} need balance or shipping payment before dispatch.
                </p>
              </div>
            )}

            {canMergePreOrderShipping && (
              <div
                className="
                rounded-3xl
                border
                border-cyan-400/35
                bg-cyan-500/10
                p-5
                shadow-[0_0_35px_rgba(34,211,238,.18)]
                "
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
                      Merge Pre-Order Shipping
                    </p>
                    <p className="mt-2 text-zinc-200">
                      Pay one dispatch charge for {ordersWithShippingDue.length} orders and {mergedShippingBatch.itemCount} arrived pre-order item{mergedShippingBatch.itemCount === 1 ? "" : "s"}.
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      Uses the same shipping rule: ₹140 up to 2 items, then ₹20 per extra item, and free shipping above ₹10,000 original value.
                    </p>
                  </div>

                  <div className="w-full md:max-w-xs">
                    <PayMergedPreOrderShippingButton
                      orderIds={ordersWithShippingDue.map(
                        (order) => order.id
                      )}
                      amount={mergedShippingBatch.shippingAmount}
                      itemCount={mergedShippingBatch.itemCount}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {[
                {
                  label: "All Orders",
                  href: "/orders",
                  active: activeFilter === "all",
                  count: uniqueOrders.length,
                },
                {
                  label: "Payment Due",
                  href: "/orders?filter=payment-due",
                  active: activeFilter === "payment-due",
                  count: paymentDueCount,
                  blink: paymentDueCount > 0,
                },
              ].map((filter) => (
                <Link
                  key={filter.href}
                  href={filter.href}
                  className={`
                    rounded-full
                    border
                    px-5
                    py-3
                    text-sm
                    font-bold
                    uppercase
                    tracking-wider
                    transition-all
                    duration-300
                    ${
                      filter.active
                        ? "border-pink-500 bg-pink-500 text-white shadow-[0_0_25px_rgba(236,72,153,.35)]"
                        : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-pink-500/60 hover:text-white"
                    }
                    ${filter.blink ? "animate-pulse" : ""}
                  `}
                >
                  {filter.label} ({filter.count})
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Orders */}
        <div className="space-y-8">

	          {filteredOrders.map((order) => {
              const orderProducts = order.products as any[]
              const status =
                orderPaymentStatus.get(order.id) || {
                  paymentDue: 0,
                  shippingDue: 0,
                  waitingForArrival: 0,
                }
              const arrivedUnpaidBalance =
                status.paymentDue
              const waitingForArrivalCount =
                status.waitingForArrival
              const arrivedUnpaidShipping =
                status.shippingDue

              return (

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

                    {formatOrderTime(
                      order.createdAt
                    )}

                  </p>

                  <p className="text-pink-400 mt-6">

                    Delivery Address

                  </p>

                  <p className="text-zinc-300 max-w-md leading-7">

                    {order.address}
                    {order.city
                      ? `, ${order.city}`
                      : ""}
                    {order.pincode
                      ? ` - ${order.pincode}`
                      : ""}

                  </p>

                </div>

                {/* PRODUCTS */}
                <div className="space-y-4">

	                  {orderProducts
                    .map((product, index) => {
                      const fallbackProduct =
                        productMap.get(product.id)
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
                      const expectedArrival =
                        product.expectedArrival ||
                        fallbackProduct?.expectedArrival
                      const pricing = getOrderItemPricing(
                        product,
                        fallbackProduct
                      )
                      const isPreOrder = pricing.isPreOrder
                      const lineOriginalPrice =
                        pricing.lineOriginalPrice
                      const lineDepositPrice =
                        pricing.linePayablePrice
                      const lineRemainingPrice =
                        pricing.lineRemainingPrice

                      return (

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
      displayImage
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

                        {isPreOrder && (
                          <div className="mt-2 inline-flex flex-col rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-cyan-100">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Pre-Order</span>
	                            <span className="text-xs mt-1">Original amount: ₹{lineOriginalPrice}</span>
	                            <span className="text-xs">Deposit paid: ₹{lineDepositPrice}</span>
		                            <span
		                              className={`text-xs font-semibold ${
		                                product.preOrderBalancePaid
		                                  ? "text-green-300"
		                                  : "text-orange-300"
		                              }`}
		                            >
		                              {product.preOrderBalancePaid
		                                ? `Balance paid: ₹${lineRemainingPrice}`
		                                : `Balance still due: ₹${lineRemainingPrice}`}
		                            </span>
		                            {product.preOrderArrived && !product.preOrderBalancePaid && (
		                              <span className="text-xs mt-1 text-green-300">Arrived - payment ready</span>
		                            )}
		                            {product.preOrderShippingPaid && (
		                              <span className="text-xs mt-1 text-green-300">Shipping paid</span>
		                            )}
	                            {expectedArrival && (
	                              <span className="text-xs mt-1">Arrives {expectedArrival}</span>
	                            )}
                          </div>
                        )}

                        <p className="text-pink-400 text-sm mt-1">
  {isPreOrder ? "Deposit paid" : "Unit price"}: ₹{isPreOrder ? lineDepositPrice : displayPrice}
</p>

                      </div>

                    </div>
                      )
                    })}

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
                        order.status === "Confirmed"
                          ? "bg-green-500/20 text-green-500 border-green-500/30"

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

	                  <div className="
	                    mt-8
	                    flex
	                    w-full
	                    max-w-sm
	                    flex-col
	                    gap-4
	                    sm:items-stretch
	                  ">

	                  <Link
		                    href={`/track-order?orderId=${encodeURIComponent(order.orderId)}`}
	                    className="w-full"
	                  >

	                    <Button
	                      className="
	                      w-full
	                      min-h-14
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

	                    {arrivedUnpaidBalance > 0 ? (
                      <PayPreOrderBalanceButton
                        orderId={order.id}
                        amount={arrivedUnpaidBalance}
                      />
                    ) : waitingForArrivalCount > 0 ? (
                      <button
                        type="button"
                        disabled
                        className="
	                        inline-flex
	                        w-full
	                        min-h-14
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-cyan-500/25
                        bg-cyan-500/10
                        px-5
                        py-3
                        text-center
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-cyan-200/80
                        opacity-70
                        "
                      >
                        Pay remaining balance will enable after stock arrives
                      </button>
                    ) : null}

	                    {arrivedUnpaidShipping > 0 ? (
	                      <PayPreOrderShippingButton
	                        orderId={order.id}
	                        amount={arrivedUnpaidShipping}
	                      />
	                    ) : null}

	                  </div>

		                </div>

              </div>

            </div>

              )
            })}

        </div>

      </div>

      <Footer />

    </main>

  )

}
