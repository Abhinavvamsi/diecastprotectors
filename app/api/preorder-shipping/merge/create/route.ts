import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getMergedPreOrderShippingBatch } from "@/lib/preorder-shipping"

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

function normalizeOrderIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter(
          (orderId): orderId is string =>
            typeof orderId === "string" &&
            Boolean(orderId.trim())
        )
        .map((orderId) => orderId.trim())
    )
  )
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { orderIds } = await req.json()
    const normalizedOrderIds = normalizeOrderIds(orderIds)

    if (normalizedOrderIds.length < 2) {
      return NextResponse.json(
        { error: "Select at least two orders to merge shipping" },
        { status: 400 }
      )
    }

    const orders = await prisma.order.findMany({
      where: {
        id: {
          in: normalizedOrderIds,
        },
        userId,
      },
    })

    if (orders.length !== normalizedOrderIds.length) {
      return NextResponse.json(
        { error: "One or more orders were not found" },
        { status: 404 }
      )
    }

    const mergedBatch = getMergedPreOrderShippingBatch(
      orders.map((order) => ({
        id: order.id,
        orderId: order.orderId,
        products: Array.isArray(order.products)
          ? (order.products as any[])
          : [],
        deliveryMethod: order.deliveryMethod,
      }))
    )

    if (mergedBatch.orderBatches.length === 0) {
      return NextResponse.json(
        { error: "No pre-order shipping is payable right now" },
        { status: 400 }
      )
    }

    if (mergedBatch.shippingAmount <= 0) {
      const paidAt = new Date().toISOString()

      await prisma.$transaction(
        mergedBatch.orderBatches.map(({ order, batch }) => {
          const paidIndexes = new Set(
            batch.items.map(({ index }) => index)
          )

          const nextProducts = order.products.map(
            (item, index) =>
              paidIndexes.has(index)
                ? {
                    ...item,
                    preOrderShippingPaid: true,
                    preOrderShippingPaidAt: paidAt,
                    preOrderShippingPaymentId:
                      "MERGED_FREE_SHIPPING",
                    preOrderShippingPaidAmount: 0,
                    preOrderShippingMergedOrderIds:
                      mergedBatch.orderBatches.map(
                        ({ order }) => order.id
                      ),
                  }
                : item
          )

          return prisma.order.update({
            where: {
              id: order.id,
            },
            data: {
              products: nextProducts as any,
            },
          })
        })
      )

      return NextResponse.json({
        success: true,
        freeShipping: true,
        payableAmount: 0,
        itemCount: mergedBatch.itemCount,
      })
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: mergedBatch.shippingAmount * 100,
      currency: "INR",
      receipt: `merge_ship_${Date.now()}`.slice(0, 40),
      notes: {
        type: "preorder_shipping_merge",
        orderIds: mergedBatch.orderBatches
          .map(({ order }) => order.id)
          .join(","),
        publicOrderIds: mergedBatch.orderBatches
          .map(({ order }) => order.orderId)
          .join(", "),
      },
    })

    return NextResponse.json({
      ...razorpayOrder,
      payableAmount: mergedBatch.shippingAmount,
      itemCount: mergedBatch.itemCount,
      orderCount: mergedBatch.orderBatches.length,
      orderIds: mergedBatch.orderBatches.map(
        ({ order }) => order.id
      ),
    })
  } catch (error) {
    console.error("Create Merged Pre-Order Shipping Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create merged pre-order shipping payment",
      },
      { status: 500 }
    )
  }
}
