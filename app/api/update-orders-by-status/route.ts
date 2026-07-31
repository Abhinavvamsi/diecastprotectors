import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import {
  buildWhatsAppItemsSummary,
  sendWhatsAppOrderMessage,
} from "@/lib/notifications"
import { NextResponse } from "next/server"

export async function POST(
  req: Request
) {

  try {

    const {
      currentStatus,
      newStatus,
    } = await req.json()

    const orders =
      await prisma.order.findMany({

        where: {
          status: currentStatus,
        },

      })

    await prisma.order.updateMany({

      where: {
        status: currentStatus,
      },

      data: {
        status: newStatus,
      },

    })

    await Promise.allSettled(
      orders.map(async (order) => {
        const orderProducts = Array.isArray(order.products)
          ? (order.products as any[])
          : []
        const whatsAppProducts =
          newStatus === "Shipped"
            ? orderProducts.filter(
                (item) =>
                  !Boolean(item?.isPreOrder)
              )
            : orderProducts

        if (newStatus === "Cancelled") {
          for (const item of orderProducts) {
            await prisma.product.update({
              where: {
                id: item.id,
              },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          }
        }

        await Promise.allSettled([
          resend.emails.send({

        from:
          "orders@shinseidiecast.com",

        to:
          order.email,

        subject:
          `Order ${order.orderId} Updated`,

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
            Your order status has been updated.
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
            ${newStatus}
          </p>

          <a
            href="https://www.shinseidiecast/track-order"
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
            Thank you for shopping with
            Shinsei Diecast.
          </p>

        </div>

        `,

          }),
          sendWhatsAppOrderMessage({
            orderId: order.orderId,
            customer: order.customer,
            phone: order.phone,
            status: newStatus,
            totalAmount: order.totalAmount,
            items: buildWhatsAppItemsSummary(
              whatsAppProducts,
              {
                includePreOrderLabel: true,
              }
            ),
          }),
        ])
      })
    )

    return NextResponse.json({

      success: true,

      updatedOrders:
        orders.length,

    })

  } catch (error) {

    console.log(error)

    return NextResponse.json(

      {
        error:
          "Failed to update orders",
      },

      {
        status: 500,
      }

    )

  }

}
