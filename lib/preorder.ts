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

export function getIndiaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  )

  return `${values.year}-${values.month}-${values.day}`
}

export function isPreOrderDeadlineActive(
  product: any,
  todayKey = getIndiaDateKey()
) {
  if (!product?.isPreOrder) return true

  const deadline = String(
    product.preOrderDeadline || ""
  ).trim()

  if (!deadline) return true

  return deadline.slice(0, 10) >= todayKey
}

export function formatIndianDisplayDate(
  value?: string | Date | null
) {
  if (!value) return ""

  const rawValue =
    value instanceof Date
      ? value.toISOString()
      : String(value).trim()

  if (!rawValue) return ""

  const normalized = rawValue.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return rawValue
  }

  const [year, month, day] = normalized.split("-")
  return `${day}-${month}-${year}`
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
    item?.depositAmount ??
    fallbackProduct?.depositAmount ??
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
