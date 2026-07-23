function getDepositSetting(product: any) {
  const rawValue = Math.max(0, Number(product.depositAmount ?? 50))
  const basePrice = Math.max(0, Number(product.price || 0))

  if (!product.isPreOrder) {
    return {
      unitDepositPrice: basePrice,
      unitRemainingPrice: 0,
    }
  }

  const unitDepositPrice =
    rawValue <= 100
      ? Math.floor((basePrice * rawValue) / 100)
      : Math.min(rawValue, basePrice)

  return {
    unitDepositPrice,
    unitRemainingPrice: Math.max(0, basePrice - unitDepositPrice),
  }
}

export function getProductPayablePrice(product: any) {
  return getDepositSetting(product).unitDepositPrice
}

export function getProductRemainingPrice(product: any) {
  return getDepositSetting(product).unitRemainingPrice
}

export function getProductPayableLinePrice(
  product: any,
  quantity = 1
) {
  return getProductPayablePrice(product) * Math.max(0, Number(quantity || 0))
}

export function getProductRemainingLinePrice(
  product: any,
  quantity = 1
) {
  return getProductRemainingPrice(product) * Math.max(0, Number(quantity || 0))
}

export function getProductOriginalLinePrice(
  product: any,
  quantity = 1
) {
  return Math.max(0, Number(product.price || 0)) * Math.max(0, Number(quantity || 0))
}

export function getOrderItemPricing(
  item: any,
  fallbackProduct: any = {}
) {
  const quantity = Math.max(
    0,
    Number(item?.quantity ?? 0)
  )
  const isPreOrder =
    Boolean(item?.isPreOrder) ||
    Boolean(fallbackProduct?.isPreOrder)

  const snapshotOriginalUnitPrice = Math.max(
    0,
    Number(
      item?.originalPrice ??
        item?.price ??
        item?.unitPrice ??
        0
    )
  )
  const fallbackOriginalUnitPrice = Math.max(
    0,
    Number(fallbackProduct?.price || 0)
  )
  const originalUnitPrice = isPreOrder
    ? Math.max(
        snapshotOriginalUnitPrice,
        fallbackOriginalUnitPrice
      )
    : snapshotOriginalUnitPrice || fallbackOriginalUnitPrice

  const snapshotPayableUnitPrice = Math.max(
    0,
    Number(item?.price ?? item?.unitPrice ?? 0)
  )
  const depositAmountSource =
    fallbackProduct?.depositAmount ??
    item?.depositAmount ??
    50
  const depositAmount = Number(
    depositAmountSource
  )
  const hasResolvedDepositSetting =
    depositAmountSource !== undefined &&
    depositAmountSource !== null
  const payableFromDepositSetting =
    getProductPayablePrice({
      ...(fallbackProduct || {}),
      ...item,
      price: originalUnitPrice,
      depositAmount,
      isPreOrder: true,
    })

  const payableUnitPrice = isPreOrder
    ? hasResolvedDepositSetting
      ? payableFromDepositSetting
      : snapshotPayableUnitPrice > 0 &&
      snapshotPayableUnitPrice < originalUnitPrice
      ? snapshotPayableUnitPrice
      : payableFromDepositSetting
    : snapshotPayableUnitPrice > 0
    ? snapshotPayableUnitPrice
    : originalUnitPrice

  const remainingUnitPrice = isPreOrder
    ? Math.max(0, originalUnitPrice - payableUnitPrice)
    : 0

  return {
    quantity,
    isPreOrder,
    originalUnitPrice,
    payableUnitPrice,
    remainingUnitPrice,
    lineOriginalPrice: originalUnitPrice * quantity,
    linePayablePrice: payableUnitPrice * quantity,
    lineRemainingPrice: remainingUnitPrice * quantity,
  }
}
