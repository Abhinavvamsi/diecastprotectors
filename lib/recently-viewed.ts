export const RECENTLY_VIEWED_PRODUCTS_KEY =
  "recently-viewed-products"

export const RECENTLY_VIEWED_PRODUCTS_LIMIT = 10

export type RecentlyViewedProduct = {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  description: string
  stock: number
  badge?: string
  isPreOrder?: boolean
  depositAmount?: number
  expectedArrival?: string | null
  preOrderDeadline?: string | null
  remainingPrice?: number
  saleOriginalPrice?: number | null
  siteDiscountPercent?: number | null
  quantityPricing?: any[]
}

export function normalizeRecentlyViewedProduct(
  product: any
): RecentlyViewedProduct | null {
  const id = String(product?.id || "")
  const name = String(product?.name || "")
  const image = String(
    product?.image ||
      product?.images?.[0] ||
      ""
  )

  if (!id || !name || !image) {
    return null
  }

  return {
    id,
    name,
    price: Math.max(
      0,
      Number(product?.price || 0)
    ),
    originalPrice:
      product?.originalPrice === undefined
        ? undefined
        : Math.max(
            0,
            Number(product.originalPrice || 0)
          ),
    image,
    description: String(
      product?.description || ""
    ),
    stock: Math.max(
      0,
      Number(product?.stock || 0)
    ),
    badge: product?.badge || undefined,
    isPreOrder: Boolean(product?.isPreOrder),
    depositAmount:
      product?.depositAmount === undefined
        ? undefined
        : Number(product.depositAmount),
    expectedArrival:
      product?.expectedArrival || undefined,
    preOrderDeadline:
      product?.preOrderDeadline || undefined,
    remainingPrice:
      product?.remainingPrice === undefined
        ? undefined
        : Math.max(
            0,
            Number(product.remainingPrice || 0)
          ),
    saleOriginalPrice:
      product?.saleOriginalPrice === undefined
        ? undefined
        : Math.max(
            0,
            Number(product.saleOriginalPrice || 0)
          ),
    siteDiscountPercent:
      product?.siteDiscountPercent === undefined
        ? undefined
        : Math.max(
            0,
            Number(product.siteDiscountPercent || 0)
          ),
    quantityPricing:
      product?.quantityPricing || undefined,
  }
}

export function readRecentlyViewedProducts() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(
        RECENTLY_VIEWED_PRODUCTS_KEY
      ) || "[]"
    )

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map(normalizeRecentlyViewedProduct)
      .filter(Boolean) as RecentlyViewedProduct[]
  } catch {
    return []
  }
}

export function saveRecentlyViewedProduct(
  product: any
) {
  if (typeof window === "undefined") {
    return
  }

  const normalized =
    normalizeRecentlyViewedProduct(product)

  if (!normalized) {
    return
  }

  const existing =
    readRecentlyViewedProducts().filter(
      (item) => item.id !== normalized.id
    )

  window.localStorage.setItem(
    RECENTLY_VIEWED_PRODUCTS_KEY,
    JSON.stringify(
      [
        normalized,
        ...existing,
      ].slice(0, RECENTLY_VIEWED_PRODUCTS_LIMIT)
    )
  )
}
