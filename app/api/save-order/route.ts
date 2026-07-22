import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { sendWhatsAppOrderMessage } from "@/lib/notifications"
import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { auth } from "@clerk/nextjs/server"
import { calculateShippingCharge } from "@/lib/shipping"

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

    const orderId =
      `HWS-${Date.now()}`

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

      const normalizedProductMap = new Map<string, any>()
      for (const item of body.products as Array<{
        id: string
        quantity: number
      }>) {
        const existing = normalizedProductMap.get(item.id)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          normalizedProductMap.set(item.id, { ...item })
        }
      }

      const normalizedProducts = Array.from(
        normalizedProductMap.values()
      )

      const productsWithDisplayData =
        normalizedProducts.map((item: any) => ({
          ...item,
          price:
            item.price ??
            item.unitPrice ??
            item.originalPrice ??
            0,
          unitPrice:
            item.unitPrice ??
            item.price ??
            item.originalPrice ??
            0,
          image: item.image || item.images?.[0] || null,
          images:
            item.images ||
            (item.image ? [item.image] : []),
          isPreOrder: Boolean(item.isPreOrder),
          depositAmount:
            Number(item.depositAmount ?? 50),
          expectedArrival:
            item.expectedArrival || null,
        }))

      const reservedItems = new Map(
        reservation.items.map((item) => [
          item.productId,
          item.quantity,
        ])
      )

      if (
        reservedItems.size !== normalizedProducts.length ||
        normalizedProducts.some(
          (item: any) =>
            reservedItems.get(item.id) !== item.quantity
        )
      ) {
        throw new Error(
          "Your cart no longer matches the reservation"
        )
      }

      if (reservation.status !== "COMPLETED") {
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
      }

      let subtotal = 0
      const productLookup = new Map<string, any>()

      // Check stock first

      for (const item of normalizedProducts) {

        const product =
          await tx.product.findUnique({

            where: {
              id: item.id,
            },

          })

        if (!product) {

          throw new Error(
            `${item.name} no longer exists`
          )

        }

        if (
          !product.isPreOrder &&
          product.stock < item.quantity
        ) {

          throw new Error(
            `${product.name} is out of stock`
          )

        }

        productLookup.set(item.id, product)

        const currentPrice = getTierPrice(
          product,
          item.quantity
        )

        const payablePrice = product.isPreOrder
          ? Math.floor(
              (currentPrice *
                Number(product.depositAmount ?? 50)) /
                100
            )
          : currentPrice

        subtotal +=
          payablePrice * item.quantity

      }

      // Reduce stock

      for (const item of normalizedProducts) {
        const product = productLookup.get(item.id)

        await tx.product.update({

          where: {
            id: item.id,
          },

          data: {

            stock: {
              decrement:
                item.quantity,
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

      const shippingCharge = calculateShippingCharge({
        subtotal,
        itemCount: normalizedProducts.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ),
        deliveryMethod: body.deliveryMethod,
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
    productsWithDisplayData as any,

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
      sendWhatsAppOrderMessage({
        orderId,
        customer: body.customer,
        phone: body.phone,
        status: "Confirmed",
        totalAmount: body.totalAmount,
      }),
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
      sendWhatsAppOrderMessage({
        orderId,
        customer: body.customer,
        phone: body.phone,
        status: "Confirmed",
        totalAmount:
          "totalAmount" in order
            ? order.totalAmount
            : Number(body.totalAmount || 0),
      }),
    ]).then((results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            index === 0
              ? "Customer email failed:"
              : index === 1
              ? "WhatsApp notification failed:"
              : "Admin email failed:",
            result.reason
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
