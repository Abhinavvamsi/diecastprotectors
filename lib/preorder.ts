export function getProductPayablePrice(product: any) {
  const basePrice = Number(product.price || 0)
  const depositPercent = Math.max(
    0,
    Math.min(
      100,
      Number(product.depositAmount ?? 50)
    )
  )

  if (!product.isPreOrder) {
    return basePrice
  }

  return Math.floor(
    (basePrice * depositPercent) / 100
  )
}

export function getProductRemainingPrice(product: any) {
  return Math.max(
    0,
    Number(product.price || 0) -
      getProductPayablePrice(product)
  )
}
