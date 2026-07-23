import { NextResponse, type NextRequest } from "next/server"
import { clerkMiddleware } from "@clerk/nextjs/server"

async function fetchWithTimeout(
  url: URL,
  request: NextRequest,
  timeoutMs: number
) {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs
  )

  try {
    return await fetch(url, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function isMaintenanceEnabled(request: NextRequest) {
  try {
    const response = await fetchWithTimeout(
      new URL("/api/admin/settings", request.url),
      request,
      1500
    )

    if (!response.ok) return false

    const settings = await response.json()
    return Boolean(settings?.maintenanceMode)
  } catch {
    return false
  }
}

async function isAdminRequest(request: NextRequest) {
  try {
    const response = await fetchWithTimeout(
      new URL("/api/admin/me", request.url),
      request,
      1500
    )

    if (!response.ok) return false

    const adminStatus = await response.json()
    return Boolean(adminStatus?.isAdmin)
  } catch {
    return false
  }
}

export default clerkMiddleware(async (_auth, request) => {
  const pathname = request.nextUrl.pathname

  const isAdminPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/add-product") ||
    pathname.startsWith("/api/update-product") ||
    pathname.startsWith("/api/delete-product") ||
    pathname.startsWith("/api/delete-products") ||
    pathname.startsWith("/api/upload-image") ||
    pathname.startsWith("/api/update-order-status")

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/maintenance") ||
    isAdminPath
  ) {
    return NextResponse.next()
  }

  const maintenanceEnabled = await isMaintenanceEnabled(request)

  if (!maintenanceEnabled) {
    return NextResponse.next()
  }

  if (await isAdminRequest(request)) {
    return NextResponse.next()
  }

  if (
    pathname.startsWith("/api/")
  ) {
    return NextResponse.json(
      {
        error: "Site is under maintenance",
      },
      { status: 503 }
    )
  }

  return NextResponse.redirect(
    new URL("/maintenance", request.url)
  )
})

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}
