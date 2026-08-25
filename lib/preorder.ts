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

  const snapshotCatalogUnitPrice = Math.max(
    0,
    Number(
      item?.catalogUnitPrice ??
      item?.originalPrice ??
        item?.discountedUnitPrice ??
        item?.payableUnitPrice ??
        item?.price ??
        item?.unitPrice ??
        0
    )
  )
  const fallbackCatalogUnitPrice = Math.max(
    0,
    Number(fallbackProduct?.price || 0)
  )
  const originalUnitPrice =
    snapshotCatalogUnitPrice ||
    fallbackCatalogUnitPrice

  const snapshotDiscountedUnitPrice = Math.max(
    0,
    Number(
      item?.discountedUnitPrice ??
        item?.effectiveUnitPrice ??
        item?.originalPrice ??
        item?.payableUnitPrice ??
        item?.unitPrice ??
        item?.price ??
        0
    )
  )
  const discountedUnitPrice =
    snapshotDiscountedUnitPrice ||
    originalUnitPrice

  const snapshotPayableUnitPrice = Math.max(
    0,
    Number(
      item?.payableUnitPrice ??
        item?.unitPrice ??
        item?.price ??
        0
    )
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
      price: discountedUnitPrice,
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
    : discountedUnitPrice

  const remainingUnitPrice = isPreOrder
    ? Math.max(0, discountedUnitPrice - payableUnitPrice)
    : 0
  const siteDiscountUnitSavings = Math.max(
    0,
    originalUnitPrice - discountedUnitPrice
  )
  const inferredDiscountPercent =
    originalUnitPrice > 0 &&
    siteDiscountUnitSavings > 0
      ? Math.round(
          (siteDiscountUnitSavings /
            originalUnitPrice) *
            100
        )
      : 0
  const siteDiscountPercentApplied = Math.max(
    0,
    Number(
      item?.siteDiscountPercentApplied ??
        item?.siteDiscountPercent ??
        inferredDiscountPercent
    )
  )

  return {
    quantity,
    isPreOrder,
    originalUnitPrice,
    discountedUnitPrice,
    payableUnitPrice,
    remainingUnitPrice,
    siteDiscountUnitSavings,
    siteDiscountPercentApplied,
    lineOriginalPrice: originalUnitPrice * quantity,
    lineDiscountedPrice: discountedUnitPrice * quantity,
    linePayablePrice: payableUnitPrice * quantity,
    lineRemainingPrice: remainingUnitPrice * quantity,
    lineSiteDiscountSavings:
      siteDiscountUnitSavings * quantity,
  }
}

export function getOrderItemsWithInferredPreOrderDiscount(
  items: any[],
  totalAmount: unknown
) {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  const allPreOrderItems = items.every((item) =>
    Boolean(item?.isPreOrder)
  )

  if (!allPreOrderItems) {
    return items
  }

  const alreadySnapshotted = items.some(
    (item) =>
      item?.discountedUnitPrice !== undefined ||
      item?.effectiveUnitPrice !== undefined ||
      item?.siteDiscountPercentApplied !== undefined
  )

  if (alreadySnapshotted) {
    return items
  }

  const paidTotal = Math.max(
    0,
    Math.round(Number(totalAmount || 0))
  )
  const baseBreakdowns = items.map((item) =>
    getOrderItemPricing(item)
  )
  const basePayableTotal = baseBreakdowns.reduce(
    (sum, pricing) => sum + pricing.linePayablePrice,
    0
  )

  if (
    paidTotal <= 0 ||
    basePayableTotal <= 0 ||
    paidTotal >= basePayableTotal
  ) {
    return items
  }

  let allocatedPaidTotal = 0

  return items.map((item, index) => {
    const pricing = baseBreakdowns[index]
    const quantity = Math.max(
      1,
      Number(item?.quantity || 1)
    )
    const linePaid =
      index === items.length - 1
        ? Math.max(0, paidTotal - allocatedPaidTotal)
        : Math.floor(
            (pricing.linePayablePrice / basePayableTotal) *
              paidTotal
          )

    allocatedPaidTotal += linePaid

    const payableUnitPrice = Math.max(
      0,
      Math.floor(linePaid / quantity)
    )
    const depositAmount = Number(
      item?.depositAmount ?? 50
    )
    const inferredDiscountedUnitPrice =
      depositAmount > 0 && depositAmount <= 100
        ? Math.ceil((payableUnitPrice * 100) / depositAmount)
        : Math.max(
            payableUnitPrice,
            pricing.discountedUnitPrice
          )

    return {
      ...item,
      price: payableUnitPrice,
      unitPrice: payableUnitPrice,
      payableUnitPrice,
      discountedUnitPrice:
        inferredDiscountedUnitPrice,
      effectiveUnitPrice:
        inferredDiscountedUnitPrice,
    }
  })
}
