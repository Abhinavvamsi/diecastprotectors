import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getOrderItemPricing } from "@/lib/preorder"

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

function getArrivedUnpaidBalance(products: any[]) {
  return products.reduce((total, item) => {
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
    const amount = getArrivedUnpaidBalance(products)

    if (amount <= 0) {
      return NextResponse.json(
        { error: "No arrived pre-order balance is payable right now" },
        { status: 400 }
      )
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `preorder_${order.orderId}_${Date.now()}`.slice(0, 40),
      notes: {
        type: "preorder_balance",
        orderId: order.id,
        publicOrderId: order.orderId,
      },
    })

    return NextResponse.json({
      ...razorpayOrder,
      payableAmount: amount,
    })
  } catch (error) {
    console.error("Create Pre-Order Balance Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create pre-order balance payment",
      },
      { status: 500 }
    )
  }
}
