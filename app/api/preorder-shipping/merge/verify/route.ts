import Razorpay from "razorpay"
import { createHmac, timingSafeEqual } from "crypto"
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

    const body = await req.json()
    const {
      orderIds,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body
    const normalizedOrderIds = normalizeOrderIds(orderIds)

    if (
      normalizedOrderIds.length < 2 ||
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

    const updatedOrders = await prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: {
          id: {
            in: normalizedOrderIds,
          },
          userId,
        },
      })

      if (orders.length !== normalizedOrderIds.length) {
        throw new Error("One or more orders were not found")
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

      if (
        mergedBatch.shippingAmount <= 0 ||
        mergedBatch.orderBatches.length === 0
      ) {
        throw new Error(
          "No pre-order shipping is payable right now"
        )
      }

      if (amountPaid !== mergedBatch.shippingAmount) {
        throw new Error(
          "Paid amount does not match current shipping due"
        )
      }

      const paidAt = new Date().toISOString()
      const mergedOrderIds = mergedBatch.orderBatches.map(
        ({ order }) => order.id
      )
      let shippingAmountStored = false
      const updates = []

      for (const { order, batch } of mergedBatch.orderBatches) {
        const dbOrder = orders.find(
          (candidate) => candidate.id === order.id
        )

        if (!dbOrder) {
          continue
        }

        const products = Array.isArray(dbOrder.products)
          ? (dbOrder.products as any[])
          : []
        const paidIndexes = new Set(
          batch.items.map(({ index }) => index)
        )
        let orderShippingAmount = 0

        const nextProducts = products.map((item, index) => {
          if (!paidIndexes.has(index)) {
            return item
          }

          const paidAmount = shippingAmountStored
            ? 0
            : mergedBatch.shippingAmount

          if (!shippingAmountStored) {
            orderShippingAmount = mergedBatch.shippingAmount
            shippingAmountStored = true
          }

          return {
            ...item,
            preOrderShippingPaid: true,
            preOrderShippingPaidAt: paidAt,
            preOrderShippingPaymentId: razorpay_payment_id,
            preOrderShippingPaidAmount: paidAmount,
            preOrderShippingMergedOrderIds: mergedOrderIds,
          }
        })

        const paymentIds = String(dbOrder.paymentId || "")
          .split(",")
          .map((paymentId) => paymentId.trim())
          .filter(Boolean)

        if (!paymentIds.includes(razorpay_payment_id)) {
          paymentIds.push(razorpay_payment_id)
        }

        updates.push(
          await tx.order.update({
            where: {
              id: dbOrder.id,
            },
            data: {
              products: nextProducts as any,
              paymentId: paymentIds.join(","),
              ...(orderShippingAmount > 0
                ? {
                    totalAmount: {
                      increment: orderShippingAmount,
                    },
                  }
                : {}),
            },
          })
        )
      }

      return updates
    })

    return NextResponse.json({
      success: true,
      orderIds: updatedOrders.map((order) => order.orderId),
      amountPaid,
    })
  } catch (error) {
    console.error("Verify Merged Pre-Order Shipping Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify merged pre-order shipping payment",
      },
      { status: 400 }
    )
  }
}
