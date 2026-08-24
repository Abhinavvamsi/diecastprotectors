export type SiteDiscountSettings = {
  siteDiscountPercent?: number | null
  siteDiscountEndsAt?: string | null
}

export function normalizeSiteDiscountPercent(value: unknown) {
  const percent = Math.floor(Number(value || 0))

  if (!Number.isFinite(percent)) {
    return 0
  }

  return Math.min(90, Math.max(0, percent))
}

export function isSiteDiscountActive(
  settings?: SiteDiscountSettings | null,
  now = new Date()
) {
  const percent = normalizeSiteDiscountPercent(
    settings?.siteDiscountPercent
  )

  if (percent <= 0) {
    return false
  }

  if (!settings?.siteDiscountEndsAt) {
    return true
  }

  const endsAt = new Date(settings.siteDiscountEndsAt)

  return (
    Number.isFinite(endsAt.getTime()) &&
    endsAt.getTime() > now.getTime()
  )
}

export function getSiteDiscountPercent(
  settings?: SiteDiscountSettings | null,
  now = new Date()
) {
  return isSiteDiscountActive(settings, now)
    ? normalizeSiteDiscountPercent(settings?.siteDiscountPercent)
    : 0
}

export function applySiteDiscountToPrice(
  price: unknown,
  settings?: SiteDiscountSettings | null,
  now = new Date()
) {
  const normalizedPrice = Math.max(
    0,
    Math.round(Number(price || 0))
  )
  const percent = getSiteDiscountPercent(settings, now)

  if (!percent) {
    return normalizedPrice
  }

  return Math.max(
    0,
    Math.floor((normalizedPrice * (100 - percent)) / 100)
  )
}

export function applySiteDiscountToProduct<
  T extends {
    price: unknown
    quantityPricing?: unknown
  },
>(
  product: T,
  settings?: SiteDiscountSettings | null,
  now = new Date()
) {
  const percent = getSiteDiscountPercent(settings, now)
  const originalPrice = Math.max(
    0,
    Math.round(Number(product.price || 0))
  )
  const discountedPrice = applySiteDiscountToPrice(
    originalPrice,
    settings,
    now
  )
  const quantityPricing = Array.isArray(product.quantityPricing)
    ? product.quantityPricing.map((tier: any) => {
        const tierOriginal = Math.max(
          0,
          Math.round(Number(tier?.price || 0))
        )
        const tierDiscounted = applySiteDiscountToPrice(
          tierOriginal,
          settings,
          now
        )

        return {
          ...tier,
          price: String(tierDiscounted),
          ...(percent && tierOriginal > tierDiscounted
            ? {
                saleOriginalPrice: tierOriginal,
              }
            : {}),
        }
      })
    : product.quantityPricing

  return {
    ...product,
    price: discountedPrice,
    quantityPricing,
    saleOriginalPrice:
      percent && originalPrice > discountedPrice
        ? originalPrice
        : null,
    siteDiscountPercent: percent,
  }
}
