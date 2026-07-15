export const FREE_SHIPPING_THRESHOLD = 10000
export const BASE_SHIPPING = 140
export const EXTRA_ITEM_SHIPPING = 20
export const BASE_SHIPPING_ITEMS = 2

export function calculateShippingCharge({
  subtotal,
  itemCount,
  deliveryMethod,
}: {
  subtotal: number
  itemCount: number
  deliveryMethod?: string
}) {
  if (deliveryMethod === "pickup") {
    return 0
  }

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0
  }

  if (itemCount <= BASE_SHIPPING_ITEMS) {
    return BASE_SHIPPING
  }

  return BASE_SHIPPING + (itemCount - BASE_SHIPPING_ITEMS) * EXTRA_ITEM_SHIPPING
}

export function getFreeShippingProgress(subtotal: number) {
  return Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1)
}

export function getAmountNeededForFreeShipping(subtotal: number) {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
}
