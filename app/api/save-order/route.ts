import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { NextResponse } from "next/server"


export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json()

    const orderId =
      `HWS-${Date.now()}`

    const order =
      await prisma.order.create({

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

          paymentId:
            body.paymentId,

        },

      })

    // Reduce stock
    for (
      const item
      of body.products
    ) {

      await prisma.product.update({

        where: {
          id: item.id,
        },

        data: {

          stock: {
            decrement:
              item.quantity,
          },

        },

      })

    }

    // Send Email
    await resend.emails.send({

      from:
        "orders@diecastprotectors.in",

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
          href="https://www.diecastprotectors.in/track-order"
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
          with Diecast Protectors.
        </p>

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
          "Failed to save order",
      },

      {
        status: 500,
      }

    )

  }

}