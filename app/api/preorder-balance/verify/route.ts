import Razorpay from "razorpay"
import { createHmac, timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getOrderItemPricing } from "@/lib/preorder"

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

function getPayableItemIndexes(products: any[]) {
  return products
    .map((item, index) => ({
      item,
      index,
      pricing: getOrderItemPricing(item),
    }))
    .filter(
      ({ item, pricing }) =>
        pricing.isPreOrder &&
        item.preOrderArrived &&
        !item.preOrderBalancePaid &&
        pricing.lineRemainingPrice > 0
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

    const body = await req.json()
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Payment verification details are required" },
        { status: 400 }
      )
    }

    const expectedSignature = createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!
    )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    const signatureIsValid =
      expectedSignature.length === razorpay_signature.length &&
      timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      )

    if (!signatureIsValid) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      )
    }

    const razorpayPayment = await razorpay.payments.fetch(
      razorpay_payment_id
    )
    const amountPaid = Math.floor(
      Number((razorpayPayment as any).amount || 0) / 100
    )

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
      })

      if (!order) {
        throw new Error("Order not found")
      }

      const products = Array.isArray(order.products)
        ? (order.products as any[])
        : []
      const payableItems = getPayableItemIndexes(products)
      const amountDue = payableItems.reduce(
        (total, { pricing }) =>
          total + pricing.lineRemainingPrice,
        0
      )

      if (amountDue <= 0) {
        throw new Error("No arrived pre-order balance is payable right now")
      }

      if (amountPaid !== amountDue) {
        throw new Error("Paid amount does not match current balance due")
      }

      const paidAt = new Date().toISOString()
      const paidIndexes = new Set(
        payableItems.map(({ index }) => index)
      )
      const nextProducts = products.map((item, index) =>
        paidIndexes.has(index)
          ? {
              ...item,
              preOrderBalancePaid: true,
              preOrderBalancePaidAt: paidAt,
              preOrderBalancePaymentId: razorpay_payment_id,
            }
          : item
      )

      return tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          products: nextProducts as any,
          totalAmount: {
            increment: amountDue,
          },
          paymentId: `${order.paymentId || ""},${razorpay_payment_id}`.replace(
            /^,/,
            ""
          ),
        },
      })
    })

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.orderId,
      amountPaid,
    })
  } catch (error) {
    console.error("Verify Pre-Order Balance Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify pre-order balance payment",
      },
      { status: 400 }
    )
  }
}
