import { getOrderItemPricing } from "@/lib/preorder"
import { calculateShippingCharge } from "@/lib/shipping"

export function getPreOrderShippingBatch(
  products: any[],
  deliveryMethod?: string
) {
  const items = products
    .map((item, index) => ({
      item,
      index,
      pricing: getOrderItemPricing(item),
    }))
    .filter(
      ({ item, pricing }) =>
        pricing.isPreOrder &&
        item.preOrderArrived &&
        !item.preOrderShippingPaid &&
        pricing.quantity > 0
    )

  const itemCount = items.reduce(
    (total, { pricing }) => total + pricing.quantity,
    0
  )
  const subtotal = items.reduce(
    (total, { pricing }) => total + pricing.lineOriginalPrice,
    0
  )
  const shippingAmount =
    itemCount > 0
      ? calculateShippingCharge({
          subtotal,
          itemCount,
          deliveryMethod,
          hasOnlyPreOrderItems: false,
        })
      : 0

  return {
    items,
    itemCount,
    subtotal,
    shippingAmount,
  }
}

export function getMergedPreOrderShippingBatch(
  orders: Array<{
    id: string
    orderId: string
    products: any[]
    deliveryMethod?: string | null
  }>
) {
  const orderBatches = orders
    .map((order) => ({
      order,
      batch: getPreOrderShippingBatch(
        order.products,
        order.deliveryMethod || undefined
      ),
    }))
    .filter(({ batch }) => batch.items.length > 0)

  const itemCount = orderBatches.reduce(
    (total, { batch }) => total + batch.itemCount,
    0
  )
  const subtotal = orderBatches.reduce(
    (total, { batch }) => total + batch.subtotal,
    0
  )
  const shippingAmount =
    itemCount > 0
      ? calculateShippingCharge({
          subtotal,
          itemCount,
          deliveryMethod: "shipping",
          hasOnlyPreOrderItems: false,
        })
      : 0

  return {
    orderBatches,
    itemCount,
    subtotal,
    shippingAmount,
  }
}

export function getPreOrderShippingPaidTotal(products: any[]) {
  return products.reduce(
    (total, item) =>
      total + Math.max(0, Number(item.preOrderShippingPaidAmount || 0)),
    0
  )
}
