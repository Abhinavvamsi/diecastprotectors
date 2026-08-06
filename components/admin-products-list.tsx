"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { toast } from "sonner"

export default function AdminProductsList({
  products,
  brands,
}: {
  products: any[]
  brands: any[]
}) {
  const SEARCH_KEY = "admin-products-search"
  const BRAND_KEY = "admin-products-brand"
  const STOCK_KEY = "admin-products-stock"

  const [items, setItems] =
    useState(products)
  const [selectedBrand, setSelectedBrand] =
    useState("All")
  const [stockFilter, setStockFilter] =
    useState("All")
  const [search, setSearch] =
    useState("")
  const [selectedIds, setSelectedIds] =
    useState<string[]>([])
const [deletingId, setDeletingId] =
  useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false)
  const [prefsReady, setPrefsReady] = useState(false)

  useEffect(() => {
    setItems(products)
  }, [products])

  useEffect(() => {
    const savedSearch = sessionStorage.getItem(SEARCH_KEY)
    const savedBrand = sessionStorage.getItem(BRAND_KEY)
    const savedStock = sessionStorage.getItem(STOCK_KEY)

    if (savedSearch !== null) setSearch(savedSearch)
    if (savedBrand !== null) setSelectedBrand(savedBrand)
    if (savedStock !== null) setStockFilter(savedStock)
    setPrefsReady(true)
  }, [])

  useEffect(() => {
    if (!prefsReady) return
    sessionStorage.setItem(SEARCH_KEY, search)
    sessionStorage.setItem(BRAND_KEY, selectedBrand)
    sessionStorage.setItem(STOCK_KEY, stockFilter)
  }, [prefsReady, search, selectedBrand, stockFilter])

  const normalizedSearch =
    search.trim().toLowerCase()

  const filteredProducts =
    items.filter((product) => {
      const matchesBrand =
        selectedBrand === "All" ||
        product.brand?.name === selectedBrand

      const availableStock = getAvailableStock(product)
      const matchesStock =
        stockFilter === "All"
          ? true
          : stockFilter === "In Stock"
          ? availableStock > 0
          : stockFilter === "Reserved"
          ? Number(product.reservedStock || 0) > 0
          : stockFilter === "Pre Order"
          ? Boolean(product.isPreOrder)
          : availableStock === 0

      const matchesSearch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.brand?.name
          ?.toLowerCase()
          .includes(normalizedSearch)

      return matchesBrand && matchesSearch && matchesStock
    })

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) =>
      selectedIds.includes(product.id)
    )

  function getAvailableStock(product: any) {
    return Math.max(
      0,
      Number(product.stock || 0) -
        Number(product.reservedStock || 0)
    )
  }

  return (
    <>
      <div className="mb-10 flex flex-col gap-4">

        <div className="flex flex-wrap gap-3">
          {["All", "In Stock", "Reserved", "Pre Order", "Out of Stock"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStockFilter(filter)}
              className={`
                h-11 px-5 rounded-full border text-sm font-semibold transition-all duration-300
                ${
                  stockFilter === filter
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent"
                    : "border-zinc-700 text-zinc-300 hover:border-pink-500"
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">

            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products, categories, or brands..."
              className="h-12 w-full rounded-xl border border-pink-400/30 bg-zinc-900/95 pl-12 pr-4 text-white outline-none transition-all placeholder:text-zinc-300/80 placeholder:uppercase placeholder:tracking-[0.06em] focus:border-pink-300 focus:ring-2 focus:ring-pink-400/25 hover:border-pink-300/55 hover:bg-zinc-900"
            />

          </div>

          <select
            value={selectedBrand}
            onChange={(e) =>
              setSelectedBrand(
                e.target.value
              )
            }
            className="
h-12
px-4
rounded-xl
border
border-zinc-700
bg-zinc-900
text-white
outline-none
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
"
          >

          <option value="All">
            All
          </option>

          {brands.map((brand) => (

            <option
              key={brand.id}
              value={brand.name}
            >
              {brand.name}
            </option>

          ))}

          </select>

        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={() => {
                setSelectedIds((current) => {
                  const visibleIds = filteredProducts.map((product) => product.id)
                  return allVisibleSelected
                    ? current.filter((id) => !visibleIds.includes(id))
                    : Array.from(new Set([...current, ...visibleIds]))
                })
              }}
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-pink-500 focus:ring-pink-500"
            />
            Select all visible products
          </label>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => setShowDeleteConfirm(true)}
            className="h-11 rounded-xl bg-red-500 px-5 font-semibold text-white transition-all duration-300 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>

      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-white">Delete selected products?</h3>
            <p className="mt-3 text-sm text-zinc-400">
              This will permanently remove {selectedIds.length} selected product{selectedIds.length === 1 ? "" : "s"}.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="h-11 rounded-xl border border-zinc-700 px-5 font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/delete-products", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        ids: selectedIds,
                      }),
                    })

                    if (!response.ok) {
                      toast.error("Failed to delete selected products")
                      return
                    }

                    setItems((current) =>
                      current.filter((product) => !selectedIds.includes(product.id))
                    )
                    setSelectedIds([])
                    toast.success("Selected products deleted successfully")
                    setShowDeleteConfirm(false)
                  } catch {
                    toast.error("Something went wrong")
                  }
                }}
                className="h-11 rounded-xl bg-red-500 px-5 font-semibold text-white transition-colors hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {filteredProducts.map((product) => (

          <div
            key={product.id}
            className="
relative
bg-zinc-900
border
border-zinc-800
shadow-2xl
rounded-3xl
overflow-hidden
transition-all
duration-300
hover:border-pink-500/40
hover:-translate-y-1
hover:shadow-[0_0_30px_rgba(236,72,153,.18)]
"
          >
            <label className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-pink-500/40 bg-zinc-950/80 backdrop-blur">
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                onChange={(event) => {
                  setSelectedIds((current) =>
                    event.target.checked
                      ? Array.from(new Set([...current, product.id]))
                      : current.filter((id) => id !== product.id)
                  )
                }}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-pink-500 focus:ring-pink-500"
              />
            </label>

            <div className="relative h-72 bg-zinc-950">

              <Image
                src={
                  Array.isArray(product.images)
                    ? String(product.images[0])
                    : "/placeholder.png"
                }
                alt={product.name}
                fill
                className="object-contain"
              />

            </div>

            <div className="p-6">

              <div className="flex gap-2 mb-3">

                <span
                  className="
px-3
py-1
rounded-full
bg-pink-500/15
text-pink-400
text-xs
border
border-pink-500/30
"
                >
                  {product.category}
                </span>

                {product.brand && (

                  <span
                   className="
px-3
py-1
rounded-full
bg-purple-500/15
text-purple-400
text-xs
border
border-purple-500/30
"
                  >
                    {product.brand.name}
                  </span>

                )}

              </div>

              <h2 className="text-2xl font-bold">

                {product.name}

              </h2>

              <p className="text-zinc-400 mt-3">

                Stock: {getAvailableStock(product)}
                {" "}
                <span className="text-zinc-500">
                  (Reserved: {product.reservedStock || 0}
                  {" "}
                  / Total: {product.stock})
                </span>

              </p>

              <div className="flex gap-3 mt-6">

                <Link
  href={`/admin/products/${product.id}/edit`}
  className="
flex-1
h-11
rounded-xl
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
font-semibold
flex
items-center
justify-center
transition-all
duration-300
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
"
>
  Edit
</Link>

               <button
  disabled={
    deletingId === product.id
  }
  onClick={async () => {

    try {

      setDeletingId(
        product.id
      )

      const response =
        await fetch(
          `/api/delete-product?id=${product.id}`,
          {
            method: "POST",
          }
        )

      if (!response.ok) {

        toast.error(
          "Failed to delete product"
        )

        setDeletingId("")

        return

      }

      toast.success(
        "Product deleted successfully"
      )

      setItems((current) =>
        current.filter((item) => item.id !== product.id)
      )
      setSelectedIds((current) =>
        current.filter((id) => id !== product.id)
      )
      setDeletingId("")

    } catch {

      toast.error(
        "Something went wrong"
      )

      setDeletingId("")

    }

  }}
 className="
flex-1
h-11
rounded-xl
border
border-pink-500
text-pink-400
font-semibold
hover:bg-pink-500
hover:text-white
transition-all
duration-300
disabled:opacity-60
"
>

  {deletingId === product.id
    ? "Deleting..."
    : "Delete"}

</button>
              </div>

            </div>

          </div>

        ))}

      </div>

      {filteredProducts.length === 0 && (

        <p className="py-12 text-center text-zinc-400">
          No products match your search.
        </p>

      )}

    </>
  )

}
