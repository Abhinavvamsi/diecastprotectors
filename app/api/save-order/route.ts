import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { sendWhatsAppOrderMessage } from "@/lib/notifications"
import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { auth } from "@clerk/nextjs/server"
import { calculateShippingCharge } from "@/lib/shipping"
import { getProductPayablePrice } from "@/lib/preorder"
import { buildWhatsAppItemsSummary } from "@/lib/notifications"

function getTierPrice(product: any, quantity: number) {
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

  return activeTier ? Number(activeTier.price) : Number(product.price || 0)
}

async function createUniqueOrderId(tx: any) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const orderId = `HWS-${Date.now() + attempt}`
    const existingOrder =
      await tx.order.findUnique({
        where: {
          orderId,
        },
        select: {
          id: true,
        },
      })

    if (!existingOrder) {
      return orderId
    }
  }

  throw new Error("Unable to generate order ID")
}

export async function POST(
  req: Request
) {

  try {
    const { userId } = await auth()

    const body =
      await req.json()
    const reservationId = body.reservationId
    const razorpayOrderId =
      body.razorpay_order_id || body.orderId
    const razorpayPaymentId =
      body.razorpay_payment_id || body.paymentId
    const razorpaySignature =
      body.razorpay_signature || body.signature

    const existingOrder = await prisma.order.findFirst({
      where: {
        reservationId,
      },
      select: {
        orderId: true,
      },
    })

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        alreadySaved: true,
        orderId: existingOrder.orderId,
      })
    }
if (
  !reservationId ||
  !razorpayOrderId ||
  !razorpayPaymentId ||
  !razorpaySignature
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
  .update(
    `${razorpayOrderId}|${razorpayPaymentId}`
  )
  .digest("hex")

const signatureIsValid =
  expectedSignature.length ===
    razorpaySignature.length &&
  timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpaySignature)
  )

if (!signatureIsValid) {
  return NextResponse.json(
    { error: "Payment verification failed" },
    { status: 400 }
  )
}
    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 }
      )
    }

    let orderId = ""

    const order =
  await prisma.$transaction(
    async (tx) => {

      const reservation =
        await tx.reservation.findUnique({
          where: {
            id: reservationId,
          },
          include: {
            items: true,
          },
        })

      const savedOrder =
        await tx.order.findFirst({
          where: {
            reservationId,
          },
          select: {
            orderId: true,
          },
        })

      if (savedOrder) {
        orderId = savedOrder.orderId

        return {
          orderId: savedOrder.orderId,
          alreadySaved: true,
        }
      }

      if (
        !reservation ||
        reservation.status === "CANCELLED"
      ) {
        throw new Error(
          "Your stock reservation has expired"
        )
      }

      if (reservation.userId !== body.userId) {
        throw new Error("Invalid stock reservation")
      }

      if (userId !== reservation.userId) {
        throw new Error("Unauthorized")
      }

      const bodyProducts = Array.isArray(body.products)
        ? body.products
        : []
      const bodyProductMap = new Map<string, any>()
      for (const item of bodyProducts as Array<{
        id: string
        quantity: number
      }>) {
        const existing = bodyProductMap.get(item.id)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          bodyProductMap.set(item.id, { ...item })
        }
      }

      let orderedItems: any[] = []

      if (reservation.status !== "COMPLETED") {
        const completedReservation =
          await tx.reservation.updateMany({
          where: {
            id: reservation.id,
            status: {
              in: ["ACTIVE", "EXPIRED"],
            },
          },
          data: {
            status: "COMPLETED",
          },
        })

        if (!completedReservation.count) {
          const savedOrder =
            await tx.order.findFirst({
              where: {
                reservationId,
              },
              select: {
                orderId: true,
              },
            })

          if (savedOrder) {
            orderId = savedOrder.orderId

            return {
              orderId: savedOrder.orderId,
              alreadySaved: true,
            }
          }

          throw new Error(
            "Your order is already being processed"
          )
        }
      } else {
        const savedOrder =
          await tx.order.findFirst({
            where: {
              reservationId,
            },
            select: {
              orderId: true,
            },
          })

        if (savedOrder) {
          orderId = savedOrder.orderId

          return {
            orderId: savedOrder.orderId,
            alreadySaved: true,
          }
        }

        throw new Error(
          "Your order is already being processed"
        )
      }

      let subtotal = 0
      let readyStockSubtotal = 0
      let readyStockItemCount = 0
      const productLookup = new Map<string, any>()

      // Check stock first

      for (const item of reservation.items) {

        const product =
          await tx.product.findUnique({

            where: {
              id: item.productId,
            },

          })

        if (!product) {

          throw new Error(
          `${item.productId} no longer exists`
        )

      }

      productLookup.set(item.productId, product)

        const currentPrice = getTierPrice(
          product,
          item.quantity
        )

        const payablePrice = product.isPreOrder
          ? getProductPayablePrice({
              ...product,
              price: currentPrice,
            })
          : currentPrice

        subtotal +=
          payablePrice * item.quantity

        if (!product.isPreOrder) {
          readyStockSubtotal +=
            payablePrice * item.quantity
          readyStockItemCount += item.quantity
        }

	      }
	
	      orderedItems = reservation.items.map((item) => {
	        const bodyItem = bodyProductMap.get(item.productId) || {}
	        const product = productLookup.get(item.productId)
	        const originalUnitPrice = getTierPrice(
	          product,
	          item.quantity
	        )
	        const payableUnitPrice = product.isPreOrder
	          ? getProductPayablePrice({
	              ...product,
	              price: originalUnitPrice,
	            })
	          : originalUnitPrice
	        const productImages = Array.isArray(product.images)
	          ? product.images
	          : []
	        const images =
	          bodyItem.images ||
	          productImages ||
	          (bodyItem.image ? [bodyItem.image] : [])

	        return {
	          id: item.productId,
	          quantity: item.quantity,
	          price: payableUnitPrice,
	          unitPrice: payableUnitPrice,
	          originalPrice: originalUnitPrice,
	          image:
	            bodyItem.image ||
	            productImages[0] ||
	            null,
	          images,
	          isPreOrder: Boolean(product.isPreOrder),
	          depositAmount: Number(product.depositAmount ?? 50),
	          expectedArrival:
	            product.expectedArrival || null,
	          name: product.name || bodyItem.name || item.productId,
	        }
	      })

	      // Reduce stock

      for (const item of reservation.items) {
        const product = productLookup.get(item.productId)
        const nextStock = Math.max(
          0,
          Number(product?.stock || 0) - item.quantity
        )

        await tx.product.update({

          where: {
            id: item.productId,
          },

          data: {

            stock: {
              set: nextStock,
            },

            reservedStock: {
              decrement:
                Math.min(
                  product?.reservedStock || 0,
                  item.quantity
                ),
            },

          },

        })

      }

      // Create order

      const hasOnlyPreOrderItems =
        reservation.items.length > 0 &&
        reservation.items.every((item) =>
          Boolean(productLookup.get(item.productId)?.isPreOrder)
        )

      const preorderItems = orderedItems.filter(
        (item) => item.isPreOrder
      )

      const preorderTotals = preorderItems.reduce(
        (
          totals: {
            depositPaid: number
            originalPrice: number
            remainingBalance: number
            expectedArrival: string
          },
          item: any
        ) => {
          const quantity = Math.max(
            0,
            Number(item.quantity || 0)
          )
          const originalUnitPrice = Math.max(
            0,
            Number(
              item.originalPrice ??
                item.unitPrice ??
                item.price ??
                0
            )
          )
          const payableUnitPrice = Math.max(
            0,
            Number(item.price ?? item.unitPrice ?? 0)
          )

          totals.originalPrice +=
            originalUnitPrice * quantity
          totals.depositPaid +=
            payableUnitPrice * quantity
          totals.remainingBalance +=
            Math.max(
              0,
              originalUnitPrice - payableUnitPrice
            ) * quantity

          if (!totals.expectedArrival && item.expectedArrival) {
            totals.expectedArrival = item.expectedArrival
          }

          return totals
        },
        {
          depositPaid: 0,
          originalPrice: 0,
          remainingBalance: 0,
          expectedArrival: "",
        }
      )

      const shippingCharge = calculateShippingCharge({
        subtotal: readyStockSubtotal,
        itemCount: readyStockItemCount,
        deliveryMethod: body.deliveryMethod,
        hasOnlyPreOrderItems,
      })

      let discount = 0

      if (body.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: {
            code: body.couponCode.toUpperCase(),
          },
        })

        if (coupon && coupon.active) {
          const usedBy = (coupon.usedBy as string[]) || []
          if (!usedBy.includes(body.userId)) {
            if (subtotal >= Number(coupon.minOrder || 0)) {
              discount =
                coupon.type === "PERCENT" ||
                coupon.type === "PERCENTAGE"
                  ? Math.floor(
                      (subtotal * Number(coupon.value)) / 100
                    )
                  : Number(coupon.value || 0)
            }
          }
        }
      }

      const totalAmount = Math.max(
        0,
        subtotal + shippingCharge - discount
      )

      orderId = await createUniqueOrderId(tx)

      return await tx.order.create({

        data: {

  status: "Confirmed",

  orderId,

  userId:
    body.userId,

  customer:
    body.customer,

  email:
    body.email,

  phone:
    body.phone,

  address:
    body.address,

  city:
    body.city,

  pincode:
    body.pincode,

  products:
    orderedItems as any,

  totalAmount:
    totalAmount,

  paymentId: razorpayPaymentId,

  reservationId:
    reservationId,

  deliveryMethod:
    body.deliveryMethod || "shipping",

  pickupLocation:
    body.pickupLocation || null,

},

      })

    }
  )

    if ("alreadySaved" in order && order.alreadySaved) {
      return NextResponse.json({
        success: true,
        alreadySaved: true,
        orderId,
      })
    }

    if (body.couponCode) {
      const coupon =
        await prisma.coupon.findUnique({
          where: {
            code:
              body.couponCode,
          },
        })

      if (coupon) {
        const usedBy =
          (coupon.usedBy as string[]) || []

        await prisma.coupon.update({
          where: {
            code:
              body.couponCode,
          },
          data: {
            usedBy: [
              ...usedBy,
              body.userId,
            ],
          },
        })
      }
    }

    const notificationProducts = Array.isArray(body.products)
      ? body.products
      : []
    const hasReadyStockNotificationItems =
      notificationProducts.some(
        (item: any) => !Boolean(item.isPreOrder)
      )
    const hasPreOrderNotificationItems =
      notificationProducts.some((item: any) =>
        Boolean(item.isPreOrder)
      )
    const notificationItems = buildWhatsAppItemsSummary(
      notificationProducts,
      {
        mixedOrderBreakdown:
          hasReadyStockNotificationItems &&
          hasPreOrderNotificationItems,
      }
    )
    const hasOnlyPreOrderNotificationItems =
      notificationProducts.length > 0 &&
      notificationProducts.every((item: any) =>
        Boolean(item.isPreOrder)
      )
    const preorderTotals = notificationProducts
      .filter((item: any) => Boolean(item.isPreOrder))
      .reduce(
        (
          totals: {
            depositPaid: number
            originalPrice: number
            remainingBalance: number
            expectedArrival: string
          },
          item: any
        ) => {
          const quantity = Math.max(
            0,
            Number(item.quantity || 0)
          )
          const originalUnitPrice = Math.max(
            0,
            Number(
              item.originalPrice ??
                item.unitPrice ??
                item.price ??
                0
            )
          )
          const payableUnitPrice = Math.max(
            0,
            Number(item.price ?? item.unitPrice ?? 0)
          )

          totals.originalPrice +=
            originalUnitPrice * quantity
          totals.depositPaid +=
            payableUnitPrice * quantity
          totals.remainingBalance +=
            Math.max(
              0,
              originalUnitPrice - payableUnitPrice
            ) * quantity

          if (!totals.expectedArrival && item.expectedArrival) {
            totals.expectedArrival = item.expectedArrival
          }

          return totals
        },
        {
          depositPaid: 0,
          originalPrice: 0,
          remainingBalance: 0,
          expectedArrival: "",
        }
      )

    const sendWithTimeout = async (
      payload: Parameters<
        typeof resend.emails.send
      >[0]
    ) => {
      return Promise.race([
        resend.emails.send(payload),
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error("Email timeout")),
            8000
          )
        ),
      ])
    }

      // Send notifications after the order is already saved.
      await Promise.allSettled([
        sendWithTimeout({
          from:
            "orders@shinseidiecast.com",
        to:
          body.email,
        subject:
          "Order Confirmed 🎉",
        html: `

      <div
        style="
          font-family: Arial;
          max-width: 600px;
          margin: auto;
          padding: 20px;
        "
      >

        <h1>
          Thank You For Your Order!
        </h1>

        <p>
          Hi ${body.customer},
        </p>

        <p>
          Your order has been
          successfully placed.
        </p>

        <p>
          <strong>
            Order ID:
          </strong>
          ${orderId}
        </p>

        <p>
          <strong>
            Total Amount:
          </strong>
          ₹${body.totalAmount}
        </p>

        <p>
          We will start processing
          your order shortly.
        </p>

        <a
          href="https://www.shinseidiecast.com"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#ef4444;
            color:white;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Track Order
        </a>

        <hr
          style="
            margin:30px 0;
          "
        />

        <p>
          Thank you for shopping
          with Shinsei Diecast.
        </p>

      </div>

        `,
      }),
      sendWhatsAppOrderMessage(
        hasOnlyPreOrderNotificationItems
          ? {
              orderId,
              customer: body.customer,
              phone: body.phone,
              status: "Confirmed",
              templateName:
                "preorder_deposit_confirmation",
              depositPaid:
                preorderTotals.depositPaid,
              originalPrice:
                preorderTotals.originalPrice,
              remainingBalance:
                preorderTotals.remainingBalance,
              expectedArrival:
                preorderTotals.expectedArrival ||
                "To be announced",
              items: notificationItems,
            }
          : {
              orderId,
              customer: body.customer,
              phone: body.phone,
              status: "Confirmed",
              templateName: "order_confirmation",
              totalAmount:
                "totalAmount" in order
                  ? order.totalAmount
                  : Number(body.totalAmount || 0),
              items: notificationItems,
            }
      ),
      sendWithTimeout({
        from:
          "orders@shinseidiecast.com",
        to:
          "abhinavvamsi2004@gmail.com",
        subject:
          `🚀 New Order Received - ${orderId}`,
        html: `

      <div
        style="
          font-family: Arial;
          max-width: 700px;
          margin: auto;
          padding: 20px;
        "
      >

        <h1>
          🚀 New Order Received
        </h1>

        <hr />

        <p>
          <strong>
            Order ID:
          </strong>
          ${orderId}
        </p>

        <p>
          <strong>
            Customer:
          </strong>
          ${body.customer}
        </p>

        <p>
          <strong>
            Email:
          </strong>
          ${body.email}
        </p>

        <p>
          <strong>
            Phone:
          </strong>
          ${body.phone}
        </p>

        <p>
          <strong>
            Address:
          </strong>
          ${body.address}
        </p>

        <p>
          <strong>
            City:
          </strong>
          ${body.city}
        </p>

        <p>
          <strong>
            Pincode:
          </strong>
          ${body.pincode}
        </p>

        <p>
          <strong>
            Total Amount:
          </strong>
          ₹${body.totalAmount}
        </p>

        <hr />

        <h2>
          Products Ordered
        </h2>

        <ul>

          ${body.products
            .map(
              (item: any) => `
                <li>
                  ${item.name}
                  ×
                  ${item.quantity}
                </li>
              `
            )
            .join("")}

        </ul>

        </div>

        `,
      }),
    ]).then((results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const reason =
            result.reason instanceof Error
              ? result.reason.message
              : result.reason

          console.error(
            index === 0
              ? "Customer email failed:"
              : index === 1
              ? "WhatsApp notification failed:"
              : "Admin email failed:",
            reason
          )
        }
      })
    })

    return NextResponse.json(
      order
    )

  } catch (error) {

    console.log(error)

    return NextResponse.json(
  {
    error:
      error instanceof Error
        ? error.message
        : "Failed to save order",
  },
  {
    status: 400,
  }
)

  }

}
