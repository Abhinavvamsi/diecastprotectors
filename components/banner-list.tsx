"use client"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

type Banner = {
  id: string
  title: string
  subtitle?: string
  images: {
    desktop: string
    mobile: string
  }
  order: number
  active: boolean
}

export default function BannerList({
  initialBanners,
}: {
  initialBanners: Banner[]
}) {

  const [banners, setBanners] =
    useState(initialBanners)

  async function deleteBanner(id: string) {

    const confirmed = window.confirm(
      "Delete this banner?"
    )

    if (!confirmed) return

    try {

      const res = await fetch(
        `/api/admin/banners/${id}`,
        {
          method: "DELETE",
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      setBanners((prev) =>
        prev.filter(
          (banner) => banner.id !== id
        )
      )

      toast.success(
        "Banner deleted"
      )

    } catch {

      toast.error(
        "Delete failed"
      )

    }

  }
  if (initialBanners.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-gray-300 p-20 text-center">

        <h2 className="text-3xl font-bold text-black">
          No Banners Yet
        </h2>

        <p className="text-gray-500 mt-3">
          Click "Add Banner" to create your first homepage banner.
        </p>

      </div>
    )
  }

  return (
    <div className="space-y-6">

      {banners.map((banner) => (

        <div
          key={banner.id}
          className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          p-6
          shadow-sm
          hover:shadow-xl
          hover:border-[#D4AF37]
          transition-all
          flex
          items-center
          justify-between
          "
        >

          <div className="flex items-center gap-6">

            <Image
              src={banner.images.desktop}
              alt={banner.title}
              width={220}
              height={120}
              className="rounded-2xl object-cover border"
            />

            <div>

              <h2 className="text-2xl font-bold text-black">
                {banner.title}
              </h2>

              <p className="text-gray-500 mt-2">
                {banner.subtitle || "No subtitle"}
              </p>

              <div className="flex gap-3 mt-4">

                <span
  className="
  px-4
  py-2
  rounded-full
  bg-gray-100
  border
  border-gray-300
  text-gray-900
  text-sm
  font-semibold
  "
>
  Order: {banner.order}
</span>

                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    banner.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {banner.active ? "Active" : "Inactive"}
                </span>

              </div>

            </div>

          </div>

          <div className="flex gap-3">

  <Link
    href={`/admin/banners/${banner.id}`}
    className="
    px-5
    py-3
    rounded-xl
    bg-[#D4AF37]
    text-black
    font-semibold
    hover:bg-[#c89f25]
    transition
    "
  >
    Edit
  </Link>

  <button
    onClick={() =>
      deleteBanner(banner.id)
    }
    className="
    px-5
    py-3
    rounded-xl
    bg-red-500
    text-white
    font-semibold
    hover:bg-red-600
    transition
    "
  >
    Delete
  </button>

</div>

        </div>

      ))}

    </div>
  )
}