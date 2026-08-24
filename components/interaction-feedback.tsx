"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function InteractionFeedback() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  useEffect(() => {
    const startFeedback = () => {
      setActive(true)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setActive(false)
      }, 900)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Element)) return

      const interactive = target.closest(
        "a, button, [role='button'], select, summary"
      )

      if (!interactive) return

      if (
        interactive instanceof HTMLButtonElement &&
        interactive.disabled
      ) {
        return
      }

      startFeedback()
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
      true
    )

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
        true
      )

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setActive(false)
  }, [pathname])

  return (
    <div
      aria-hidden="true"
      className={`
fixed
left-0
top-0
z-[999999]
h-1
w-full
origin-left
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-cyan-400
shadow-[0_0_24px_rgba(236,72,153,.55)]
transition-all
duration-500
ease-out
pointer-events-none
${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
`}
    />
  )
}
