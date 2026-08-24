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

    const body = await req.json()
    const { arrived = true } = body
    const rawProductIds: unknown[] =
      Array.isArray(body.productIds)
        ? body.productIds
        : [body.productId]

    const productIds =
      Array.from(
        new Set(
          rawProductIds
            .filter(
              (id: unknown): id is string =>
                typeof id === "string" && id.trim().length > 0
            )
            .map((id: string) => id.trim())
        )
      )

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      )
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isPreOrder: true,
      },
      select: {
        id: true,
      },
    })

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Pre-order product not found" },
        { status: 404 }
      )
    }

    const productIdSet =
      new Set(products.map((product) => product.id))

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
      const arrivedNotificationItems: any[] = []

      const nextProducts = products.map((item) => {
        const itemProductId =
          typeof item?.id === "string"
            ? item.id
            : typeof item?.productId === "string"
              ? item.productId
              : ""

        const isTargetPreOrder =
          productIdSet.has(itemProductId) &&
          Boolean(item?.isPreOrder)

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
          arrivedNotificationItems.push(item)
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
            items: buildWhatsAppItemsSummary(
              arrivedNotificationItems,
              {
                includePreOrderLabel: true,
              }
            ),
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
      productCount: productIds.length,
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
