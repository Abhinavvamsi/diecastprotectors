const CLOUDINARY_UPLOAD_SEGMENT = "/upload/"

export function getCloudinaryOptimizedUrl(
  url: string,
  transformation: string
) {
  if (
    !url ||
    !url.includes(CLOUDINARY_UPLOAD_SEGMENT)
  ) {
    return url
  }

  const [base, rest] = url.split(CLOUDINARY_UPLOAD_SEGMENT)

  if (!base || !rest) {
    return url
  }

  if (
    rest.startsWith("f_") ||
    rest.startsWith("q_") ||
    rest.startsWith("c_") ||
    rest.startsWith("w_")
  ) {
    return url
  }

  return `${base}${CLOUDINARY_UPLOAD_SEGMENT}${transformation}/${rest}`
}

export function getBannerDesktopUrl(url: string) {
  return getCloudinaryOptimizedUrl(
    url,
    "f_auto,q_auto,w_1800,c_fill"
  )
}

export function getBannerMobileUrl(url: string) {
  return getCloudinaryOptimizedUrl(
    url,
    "f_auto,q_auto,w_900,c_fill"
  )
}

export function getBrandLogoUrl(url: string) {
  return getCloudinaryOptimizedUrl(
    url,
    "f_auto,q_auto,w_320,c_fit"
  )
}
