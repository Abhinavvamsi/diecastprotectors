import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { requireOwner } from "@/lib/admin"

export async function GET() {

  await requireOwner()

  const workbook =
    XLSX.utils.book_new()

  const regularRows = [
    {
      Name: "BMW M3 GTR",
      Description:
        "Premium diecast collectible",
      Price: 1199,
      Stock: 10,
      Brand: "Hot Wheels",
      Category: "Cars",
      Badge: "NEW",
      Image: "bmw-m3-gtr.jpg",
    },
  ]

  const preOrderRows = [
    {
      Name: "Ferrari Testarossa",
      Description:
        "Upcoming pre-order collectible",
      Price: 999,
      Stock: 20,
      Brand: "Hot Wheels",
      Category: "Cars",
      Badge: "PRE ORDER",
      Image: "ferrari-testarossa.jpg",
      Deposit: 700,
      ExpectedArrival: "Aug 2026",
      PreOrderDeadline: "2026-08-31",
    },
  ]

  const guideRows = [
    {
      Field: "Name",
      Notes: "Product name. Must be unique.",
    },
    {
      Field: "Description",
      Notes: "Short product description.",
    },
    {
      Field: "Price",
      Notes: "Original full product price.",
    },
    {
      Field: "Stock",
      Notes: "Total stock quantity.",
    },
    {
      Field: "Brand",
      Notes: "Must exactly match an existing brand name.",
    },
    {
      Field: "Category",
      Notes: "Cars or Protectors. Pre-orders default to Cars if blank.",
    },
    {
      Field: "Image",
      Notes: "Must match the image file name inside your ZIP.",
    },
    {
      Field: "Deposit",
      Notes: "Pre-orders only. Use 1-100 for percentage, or above 100 for fixed rupee deposit.",
    },
    {
      Field: "ExpectedArrival",
      Notes: "Pre-orders only. Example: Aug 2026.",
    },
    {
      Field: "PreOrderDeadline",
      Notes: "Optional. Use YYYY-MM-DD format.",
    },
  ]

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(regularRows),
    "Regular Stock"
  )

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(preOrderRows),
    "Pre Orders"
  )

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(guideRows),
    "Guide"
  )

  const buffer =
    XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    })

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="shinsei-bulk-import-template.xlsx"',
    },
  })

}
