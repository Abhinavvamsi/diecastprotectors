import Razorpay from "razorpay"
import { createHmac, timingSafeEqual } from "crypto"
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
      const batch = getPreOrderShippingBatch(
        products,
        order.deliveryMethod
      )

      if (batch.shippingAmount <= 0 || batch.items.length === 0) {
        throw new Error("No pre-order shipping is payable right now")
      }

      if (amountPaid !== batch.shippingAmount) {
        throw new Error("Paid amount does not match current shipping due")
      }

      const paidAt = new Date().toISOString()
      const paidIndexes = new Set(
        batch.items.map(({ index }) => index)
      )
      let shippingAmountStored = false

      const nextProducts = products.map((item, index) => {
        if (!paidIndexes.has(index)) {
          return item
        }

        const paidAmount = shippingAmountStored
          ? 0
          : batch.shippingAmount
        shippingAmountStored = true

        return {
          ...item,
          preOrderShippingPaid: true,
          preOrderShippingPaidAt: paidAt,
          preOrderShippingPaymentId: razorpay_payment_id,
          preOrderShippingPaidAmount: paidAmount,
        }
      })

      return tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          products: nextProducts as any,
          totalAmount: {
            increment: batch.shippingAmount,
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
    console.error("Verify Pre-Order Shipping Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify pre-order shipping payment",
      },
      { status: 400 }
    )
  }
}
