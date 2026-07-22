import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { calculateShippingCharge } from "@/lib/shipping"
import { getProductPayablePrice } from "@/lib/preorder"

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
    const hasOnlyPreOrderItems =
      reservation.items.length > 0 &&
      reservation.items.every((item) =>
        Boolean(productMap.get(item.productId)?.isPreOrder)
      )
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

      return sum + payablePrice * item.quantity
    }, 0)

    let discount = 0

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
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
      subtotal,
      itemCount: reservation.items.reduce((sum, item) => sum + item.quantity, 0),
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
