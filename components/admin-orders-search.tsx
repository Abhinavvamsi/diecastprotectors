"use client"

import { useEffect, useState } from "react"

type AdminOrdersSearchProps = {
  initialSearch: string
}

export default function AdminOrdersSearch({
  initialSearch,
}: AdminOrdersSearchProps) {
  const [value, setValue] = useState(initialSearch)

  useEffect(() => {
    setValue(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const term = value.trim().toLowerCase()
      const orderCards = document.querySelectorAll<HTMLElement>(
        "[data-admin-order-card]"
      )
      let visibleCount = 0

      orderCards.forEach((card) => {
        const searchIndex = card.dataset.orderSearch || ""
        const shouldShow = !term || searchIndex.includes(term)
        card.style.display = shouldShow ? "" : "none"
        if (shouldShow) visibleCount += 1
      })

      const emptyState = document.querySelector<HTMLElement>(
        "[data-admin-orders-empty]"
      )
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? "" : "none"
      }
    }, 120)

    return () => window.clearTimeout(timeout)
  }, [value])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (value.trim()) {
      params.set("search", value.trim())
    } else {
      params.delete("search")
    }

    const next = params.toString()
    const url = next
      ? `${window.location.pathname}?${next}`
      : window.location.pathname
    window.history.replaceState({}, "", url)
  }, [value])

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Search Order ID, Customer Name, Phone Number, or Car Model"
      className="
      w-full
      h-14
      rounded-2xl
      bg-zinc-900
      border-zinc-700
      text-white
      placeholder:text-zinc-500
      focus:border-pink-500
      focus:ring-pink-500/30
      border
      px-5
      outline-none
      focus:ring-2
      transition-all
      "
    />
  )
}
