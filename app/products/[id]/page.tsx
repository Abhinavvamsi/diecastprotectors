import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"

import ProductDetails from "@/components/product-details"
import { isPreOrderDeadlineActive } from "@/lib/preorder"

type ProductPageProps = {

  params: Promise<{
    id: string
  }>

}

export default async function ProductPage({
  params,
}: ProductPageProps) {

  const { id } = await params

  const product =
    await prisma.product.findUnique({

      where: {
        id,
      },

    })

	  if (!product) {

    notFound()

	  }

	  if (
	    product.isPreOrder &&
	    !isPreOrderDeadlineActive(product)
	  ) {
	
	    notFound()
	
	  }

  const hiddenSaleProduct =
    await prisma.$queryRaw<
      Array<{
        id: string
      }>
    >`
      SELECT id
      FROM "Product"
      WHERE id = ${product.id}
        AND "saleHiddenUntil" IS NOT NULL
        AND "saleHiddenUntil" > ${new Date().toISOString()}
      LIMIT 1
    `

  if (hiddenSaleProduct.length > 0) {
    notFound()
  }

  const availableProduct = {
    ...product,
    stock: Math.max(
      0,
      product.stock - product.reservedStock
    ),
  }

  return (

    <ProductDetails product={availableProduct} />

  )

}
