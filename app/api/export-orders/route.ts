import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

import * as XLSX from "xlsx"

export async function GET() {

  const orders =
    await prisma.order.findMany({

      orderBy: {
        createdAt: "desc",
      },

    })

  const rows =
  orders.flatMap((order) =>

    (order.products as any[])
      .map((product) => ({

        "Order ID":
          order.orderId,

        Customer:
          order.customer,

        Phone:
          order.phone,

        Address:
          `${order.address},
          ${order.city}
          - ${order.pincode}`,

        "Product Name":
          product.name,

        Quantity:
          product.quantity,

        "Unit Price":
          product.price,

        Amount:
          product.price *
          product.quantity,

        Status:
          order.status,

        "Payment ID":
          order.paymentId,

        Date:
  new Date(
    order.createdAt
  ).toLocaleString(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",
    }
  )
      }))

  )

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows
    )

  const workbook =
    XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(

    workbook,

    worksheet,

    "Orders"

  )

  const buffer =
    XLSX.write(
      workbook,
      {
        type: "buffer",
        bookType: "xlsx",
      }
    )

  return new NextResponse(
    buffer,
    {

      headers: {

        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          'attachment; filename="orders.xlsx"',

      },

    }
  )

}