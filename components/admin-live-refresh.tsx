"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLiveRefresh({
  intervalMs = 15000,
}: {
  intervalMs?: number
}) {
  const router = useRouter()

  useEffect(() => {
    const refresh = () => router.refresh()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh()
      }
    }

    const handleFocus = () => {
      refresh()
    }

    const timer = window.setInterval(refresh, intervalMs)

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      )
      window.removeEventListener("focus", handleFocus)
    }
  }, [intervalMs, router])

  return null
}
