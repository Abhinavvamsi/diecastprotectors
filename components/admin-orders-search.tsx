"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type AdminOrdersSearchProps = {
  initialSearch: string
}

export default function AdminOrdersSearch({
  initialSearch,
}: AdminOrdersSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialSearch)

  useEffect(() => {
    setValue(initialSearch)
  }, [initialSearch])

  const nextQuery = useMemo(() => {
    return (search: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (search.trim()) {
        params.set("search", search.trim())
      } else {
        params.delete("search")
      }

      return params.toString()
    }
  }, [searchParams])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const query = nextQuery(value)
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      })
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [pathname, router, nextQuery, value])

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
