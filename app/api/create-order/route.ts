import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { calculateShippingCharge } from "@/lib/shipping"
import {
  getIndiaDateKey,
  getProductPayablePrice,
  isPreOrderDeadlineActive,
} from "@/lib/preorder"

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

function getTierPrice(
  product: any,
  quantity: number
) {
  const tiers = (product.quantityPricing || []) as Array<{
    quantity: string
    price: string
  }>

  const activeTier = tiers
    .filter((tier) => quantity >= Number(tier.quantity))
    .sort(
      (a, b) =>
        Number(b.quantity) - Number(a.quantity)
    )[0]

  return activeTier
    ? Number(activeTier.price)
    : Number(product.price || 0)
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
    const { reservationId, couponCode, deliveryMethod } = body

    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID required" },
        { status: 400 }
      )
    }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { items: true },
  })

    if (!reservation || reservation.userId !== userId) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      )
    }

    const productIds = reservation.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

	    const productMap = new Map(products.map((product) => [product.id, product]))
	    const todayKey = getIndiaDateKey()
      const hiddenSaleIds = new Set(
        (
          await prisma.$queryRaw<
            Array<{
              id: string
            }>
          >`
            SELECT id
            FROM "Product"
            WHERE id IN (${Prisma.join(productIds)})
              AND "saleHiddenUntil" IS NOT NULL
              AND "saleHiddenUntil" > ${new Date().toISOString()}
          `
        ).map((product) => product.id)
      )
	
	    for (const item of reservation.items) {
	      const product = productMap.get(item.productId)
	
	      if (
	        product?.isPreOrder &&
	        !isPreOrderDeadlineActive(product, todayKey)
	      ) {
	        return NextResponse.json(
	          {
	            error: `${product.name} pre-order deadline has ended`,
	          },
	          {
	            status: 400,
	          }
	        )
	      }

      if (
        product &&
        hiddenSaleIds.has(product.id)
      ) {
        return NextResponse.json(
          {
            error: `${product.name} will be available when the sale starts`,
          },
          {
            status: 400,
          }
        )
      }
	    }
    const hasOnlyPreOrderItems =
      reservation.items.length > 0 &&
      reservation.items.every((item) =>
        Boolean(productMap.get(item.productId)?.isPreOrder)
      )
    const normalizedCouponCode =
      typeof couponCode === "string" && couponCode.trim()
        ? couponCode.trim().toUpperCase()
        : null

    let readyStockSubtotal = 0
    let readyStockItemCount = 0

    const subtotal = reservation.items.reduce((sum, item) => {
      const product = productMap.get(item.productId)
      if (!product) return sum
      const currentPrice = getTierPrice(product, item.quantity)
      const payablePrice = product.isPreOrder
        ? getProductPayablePrice({
            ...product,
            price: currentPrice,
          })
        : currentPrice

      if (!product.isPreOrder) {
        readyStockSubtotal += payablePrice * item.quantity
        readyStockItemCount += item.quantity
      }

      return sum + payablePrice * item.quantity
    }, 0)

    let discount = 0

    if (normalizedCouponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: normalizedCouponCode },
      })

      if (
        coupon &&
        coupon.active &&
        subtotal >= Number(coupon.minOrder || 0)
      ) {
        const usedBy = (coupon.usedBy as string[]) || []
        if (!usedBy.includes(userId)) {
          discount =
            coupon.type === "PERCENT" ||
            coupon.type === "PERCENTAGE"
              ? Math.floor((subtotal * Number(coupon.value)) / 100)
              : Number(coupon.value || 0)
        }
      }
    }

    const shippingCharge = calculateShippingCharge({
      subtotal: readyStockSubtotal,
      itemCount: readyStockItemCount,
      deliveryMethod,
      hasOnlyPreOrderItems,
    })

    const amount = Math.max(0, subtotal + shippingCharge - discount)

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      ...order,
      amount,
    })
  } catch (error) {
    console.error("Create Order Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Razorpay order" },
      { status: 500 }
    )
  }
}
