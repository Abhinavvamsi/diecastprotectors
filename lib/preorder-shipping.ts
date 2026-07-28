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

export function getPreOrderShippingPaidTotal(products: any[]) {
  return products.reduce(
    (total, item) =>
      total + Math.max(0, Number(item.preOrderShippingPaidAmount || 0)),
    0
  )
}
