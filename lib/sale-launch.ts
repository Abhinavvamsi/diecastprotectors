export function isFutureSaleLaunch(
  value?: string | null
) {
  if (!value) return false

  const launchTime = new Date(value).getTime()

  return (
    Number.isFinite(launchTime) &&
    launchTime > Date.now()
  )
}

export function isSaleHidden(
  product: {
    saleHiddenUntil?: string | null
  }
) {
  return isFutureSaleLaunch(
    product.saleHiddenUntil
  )
}
