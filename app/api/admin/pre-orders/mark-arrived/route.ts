import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { getOrderItemPricing } from "@/lib/preorder"
import {
  buildWhatsAppItemsSummary,
  sendWhatsAppOrderMessage,
} from "@/lib/notifications"

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const { productId, arrived = true } = await req.json()

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        name: true,
        isPreOrder: true,
      },
    })

    if (!product || !product.isPreOrder) {
      return NextResponse.json(
        { error: "Pre-order product not found" },
        { status: 404 }
      )
    }

    const orders = await prisma.order.findMany({
      where: {
        status: {
          not: "Cancelled",
        },
      },
    })

    const markArrived = Boolean(arrived)
    let updatedOrders = 0
    let updatedItems = 0
    let lockedItems = 0

    const notificationJobs: Promise<unknown>[] = []

    for (const order of orders) {
      const products = Array.isArray(order.products)
        ? (order.products as any[])
        : []
      let orderChanged = false
      let orderBalanceDue = 0

      const nextProducts = products.map((item) => {
        const isTargetPreOrder =
          item?.id === productId && Boolean(item?.isPreOrder)

        if (!isTargetPreOrder) {
          return item
        }

        if (markArrived && item.preOrderArrived) {
          return item
        }

        const pricing = getOrderItemPricing(item)
        if (!markArrived) {
          if (!item.preOrderArrived) {
            return item
          }

          if (item.preOrderBalancePaid) {
            lockedItems += 1
            return item
          }

          orderChanged = true
          updatedItems += 1

          return {
            ...item,
            preOrderArrived: false,
            preOrderArrivedAt: null,
          }
        }

        orderChanged = true
        updatedItems += 1

        if (!item.preOrderBalancePaid) {
          orderBalanceDue += pricing.lineRemainingPrice
        }

        return {
          ...item,
          preOrderArrived: true,
          preOrderArrivedAt:
            item.preOrderArrivedAt || new Date().toISOString(),
        }
      })

      if (!orderChanged) {
        continue
      }

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          products: nextProducts as any,
        },
      })

      updatedOrders += 1

      if (markArrived && orderBalanceDue > 0) {
        notificationJobs.push(
          sendWhatsAppOrderMessage({
            orderId: order.orderId,
            customer: order.customer,
            phone: order.phone,
            status: "Confirmed",
            templateName: "preorder_ready_for_payment",
            remainingBalance: orderBalanceDue,
            items: buildWhatsAppItemsSummary(products),
          }).catch((error) => {
            console.error(
              "Pre-order ready WhatsApp failed:",
              error
            )
          })
        )
      }
    }

    await Promise.allSettled(notificationJobs)

    return NextResponse.json({
      success: true,
      arrived: markArrived,
      updatedOrders,
      updatedItems,
      lockedItems,
    })
  } catch (error) {
    console.error("Bulk Pre-Order Arrival Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark pre-order product as arrived",
      },
      { status: 500 }
    )
  }
}
