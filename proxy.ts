import { NextResponse, type NextRequest } from "next/server"
import { clerkMiddleware } from "@clerk/nextjs/server"

async function isMaintenanceEnabled(request: NextRequest) {
  try {
    const response = await fetch(
      new URL("/api/admin/settings", request.url),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    )

    if (!response.ok) return false

    const settings = await response.json()
    return Boolean(settings?.maintenanceMode)
  } catch {
    return false
  }
}

async function isAdmin(request: NextRequest) {
  try {
    const response = await fetch(
      new URL("/api/admin/me", request.url),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      }
    )

    if (!response.ok) return false

    const data = await response.json()
    return Boolean(data?.isAdmin)
  } catch {
    return false
  }
}

export default clerkMiddleware(async (_auth, request) => {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/admin/settings") ||
    pathname.startsWith("/api/admin/me") ||
    pathname.startsWith("/maintenance")
  ) {
    return NextResponse.next()
  }

  const maintenanceEnabled = await isMaintenanceEnabled(request)

  if (!maintenanceEnabled) {
    return NextResponse.next()
  }

  const admin = await isAdmin(request)

  if (admin) {
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
