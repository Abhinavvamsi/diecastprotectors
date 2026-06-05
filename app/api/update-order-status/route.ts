import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"

export async function POST(
  req: Request
) {

  try {

    const user =
      await currentUser()

    const isAdmin =
      user?.primaryEmailAddress
        ?.emailAddress ===
      "abhinavvamsi2004@gmail.com"

    if (!isAdmin) {

      return NextResponse.json(

        {
          error:
            "Unauthorized",
        },

        {
          status: 401,
        }

      )

    }

    const body =
      await req.json()

    const order =
      await prisma.order.findUnique({

        where: {
          id: body.orderId,
        },

      })

    if (!order) {

      return NextResponse.json(

        {
          error:
            "Order not found",
        },

        {
          status: 404,
        }

      )

    }

    /* Restore stock if cancelled */
    if (
      body.status ===
      "Cancelled"
    ) {

      const products =
        order.products as any[]

      for (const item of products) {

        await prisma.product.update({

          where: {
            id: item.id,
          },

          data: {

            stock: {
              increment:
                item.quantity,
            },

          },

        })

      }

    }

    const updatedOrder =
      await prisma.order.update({

        where: {
          id: body.orderId,
        },

        data: {

          status:
            body.status,

        },

      })

    // Email Notification
    await resend.emails.send({

      from:
        "orders@diecastprotectors.in",

      to:
        order.email,

      subject:
        `Order Update - ${body.status}`,

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
          Order Status Updated
        </h1>

        <p>
          Hi ${order.customer},
        </p>

        <p>
          Your order status
          has been updated.
        </p>

        <p>
          <strong>
            Order ID:
          </strong>
          ${order.orderId}
        </p>

        <p>
          <strong>
            New Status:
          </strong>
          ${body.status}
        </p>

        <hr />

        ${
          body.status ===
          "Shipped"

            ? `
            <h2>
              🚚 Your order has been shipped!
            </h2>
            <p>
              It is now on the way.
            </p>
            `

            : body.status ===
              "Delivered"

            ? `
            <h2>
              🎉 Order Delivered
            </h2>
            <p>
              Thank you for shopping
              with us.
            </p>
            `

            : body.status ===
              "Cancelled"

            ? `
            <h2>
              ❌ Order Cancelled
            </h2>
            <p>
              Your order has been
              cancelled.
            </p>
            `

            : `
            <h2>
              📦 Order Processing
            </h2>
            <p>
              We are preparing
              your order.
            </p>
            `
        }

        <a
          href="https://www.diecastprotectors.in/track-order"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#ef4444;
            color:white;
            text-decoration:none;
            border-radius:8px;
            margin-top:20px;
          "
        >

          Track Order

        </a>

      </div>

      `,

    })

    return NextResponse.json(
      updatedOrder
    )

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {
        error:
          "Failed to update order",
      },

      {
        status: 500,
      }

    )

  }

}