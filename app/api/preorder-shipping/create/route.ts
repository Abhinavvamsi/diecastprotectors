import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getPreOrderShippingBatch } from "@/lib/preorder-shipping"

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const products = Array.isArray(order.products)
      ? (order.products as any[])
      : []
    const batch = getPreOrderShippingBatch(
      products,
      order.deliveryMethod
    )

    if (batch.items.length === 0) {
      return NextResponse.json(
        { error: "No pre-order shipping is payable right now" },
        { status: 400 }
      )
    }

    if (batch.shippingAmount <= 0) {
      const paidAt = new Date().toISOString()
      const paidIndexes = new Set(
        batch.items.map(({ index }) => index)
      )
      const nextProducts = products.map((item, index) =>
        paidIndexes.has(index)
          ? {
              ...item,
              preOrderShippingPaid: true,
              preOrderShippingPaidAt: paidAt,
              preOrderShippingPaymentId: "FREE_SHIPPING",
              preOrderShippingPaidAmount: 0,
            }
          : item
      )

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          products: nextProducts as any,
        },
      })

      return NextResponse.json({
        success: true,
        freeShipping: true,
        payableAmount: 0,
        itemCount: batch.itemCount,
      })
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: batch.shippingAmount * 100,
      currency: "INR",
      receipt: `ship_${order.orderId}_${Date.now()}`.slice(0, 40),
      notes: {
        type: "preorder_shipping",
        orderId: order.id,
        publicOrderId: order.orderId,
      },
    })

    return NextResponse.json({
      ...razorpayOrder,
      payableAmount: batch.shippingAmount,
      itemCount: batch.itemCount,
    })
  } catch (error) {
    console.error("Create Pre-Order Shipping Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create pre-order shipping payment",
      },
      { status: 500 }
    )
  }
}
