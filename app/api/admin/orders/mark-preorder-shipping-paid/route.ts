import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { getPreOrderShippingBatch } from "@/lib/preorder-shipping"
import { getOrderItemPricing } from "@/lib/preorder"

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const { orderId, mode } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
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
    const shouldCoverWithExistingShipping =
      mode === "covered"
    const coverableItems = products
      .map((item, index) => ({
        item,
        index,
      }))
      .filter(
        ({ item }) =>
          getOrderItemPricing(item).isPreOrder &&
          !item.preOrderShippingPaid
      )
    const selectedItems =
      shouldCoverWithExistingShipping
        ? coverableItems
        : batch.items

    if (selectedItems.length === 0) {
      return NextResponse.json(
        { error: "No pre-order shipping is due for this order" },
        { status: 400 }
      )
    }

    const paidAt = new Date().toISOString()
    const paidIndexes = new Set(
      selectedItems.map(({ index }) => index)
    )
    let shippingAmountStored = false

    const nextProducts = products.map((item, index) => {
      if (!paidIndexes.has(index)) {
        return item
      }

      const paidAmount =
        shouldCoverWithExistingShipping || shippingAmountStored
          ? 0
          : batch.shippingAmount
      shippingAmountStored = true

      return {
        ...item,
        preOrderShippingPaid: true,
        preOrderShippingPaidAt: paidAt,
        preOrderShippingPaymentId: shouldCoverWithExistingShipping
          ? "ADMIN_MARKED_COVERED"
          : "ADMIN_MARKED_PAID",
        preOrderShippingPaidAmount: paidAmount,
      }
    })

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
      amountPaid: shouldCoverWithExistingShipping
        ? 0
        : batch.shippingAmount,
      mode: shouldCoverWithExistingShipping
        ? "covered"
        : "paid",
      updatedItems: selectedItems.length,
    })
  } catch (error) {
    console.error("Admin Mark Pre-Order Shipping Paid Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark pre-order shipping paid",
      },
      { status: 500 }
    )
  }
}
