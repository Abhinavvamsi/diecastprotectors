import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()
const {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
} = body

if (
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
  .update(
    `${razorpay_order_id}|${razorpay_payment_id}`
  )
  .digest("hex")

const signatureIsValid =
  expectedSignature.length ===
    razorpay_signature.length &&
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
    if (!body.reservationId) {
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
            id: body.reservationId,
          },
          include: {
            items: true,
          },
        })

      if (
        !reservation ||
        reservation.status !== "ACTIVE" ||
        reservation.expiresAt <= new Date()
      ) {
        throw new Error(
          "Your stock reservation has expired"
        )
      }

      if (reservation.userId !== body.userId) {
        throw new Error("Invalid stock reservation")
      }

      const reservedItems = new Map(
        reservation.items.map((item) => [
          item.productId,
          item.quantity,
        ])
      )

      if (
        reservedItems.size !== body.products.length ||
        body.products.some(
          (item: any) =>
            reservedItems.get(item.id) !== item.quantity
        )
      ) {
        throw new Error(
          "Your cart no longer matches the reservation"
        )
      }

      const completedReservation =
        await tx.reservation.updateMany({
          where: {
            id: reservation.id,
            status: "ACTIVE",
            expiresAt: {
              gt: new Date(),
            },
          },
          data: {
            status: "COMPLETED",
          },
        })

      if (!completedReservation.count) {
        throw new Error(
          "Your stock reservation has expired"
        )
      }

      // Check stock first

      for (const item of body.products) {

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
          product.stock <
          item.quantity ||
          product.reservedStock < item.quantity
        ) {

          throw new Error(
            `${product.name} is out of stock`
          )

        }

      }

      // Reduce stock

      for (const item of body.products) {

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
                item.quantity,
            },

          },

        })

      }

      // Create order

      return await tx.order.create({

        data: {

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
    body.products,

  totalAmount:
    body.totalAmount,

  paymentId: razorpay_payment_id,

  reservationId:
    body.reservationId,

  deliveryMethod:
    body.deliveryMethod || "shipping",

  pickupLocation:
    body.pickupLocation || null,

},

      })

    }
  )
  // Mark coupon as used
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
    // Customer Email
    await resend.emails.send({

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

    })

    // Admin Email
    await resend.emails.send({

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
