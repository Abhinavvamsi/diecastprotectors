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
      <div className="rounded-3xl border-2 border-dashed border-zinc-700 bg-zinc-900 p-20 text-center">

        <h2 className="text-3xl font-bold text-white">
          No Banners Yet
        </h2>

        <p className="text-zinc-400 mt-3">
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
          className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 shadow-2xl hover:shadow-[0_0_30px_rgba(236,72,153,.18)] hover:border-pink-500/40 transition-all duration-300 flex flex-col md:flex-row gap-6 md:items-center md:justify-between"
        >

          <div className="flex flex-col md:flex-row gap-6 w-full">

            <Image
              src={banner.images.desktop}
              alt={banner.title}
              width={220}
              height={120}
             className="w-full md:w-[220px] h-52 md:h-[120px] rounded-2xl object-cover border border-zinc-700"
            />

            <div className="flex-1">

              <h2 className="text-2xl font-bold text-white">
                {banner.title}
              </h2>

              <p className="text-zinc-400 mt-2">
                {banner.subtitle || "No subtitle"}
              </p>

              <div className="flex gap-3 mt-4">

                <span
  className="
px-4
py-2
rounded-full
bg-zinc-800
border
border-zinc-700
text-white
text-sm
font-semibold
"
>
  Order: {banner.order}
</span>

                <span
                  className={`px-4 py-2 rounded-full text-sm ${
                    banner.active
? "bg-green-500/20 text-green-400 border border-green-500/30"
: "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {banner.active ? "Active" : "Inactive"}
                </span>

              </div>

            </div>

          </div>

          <div className="flex w-full md:w-auto gap-3 mt-4 md:mt-0">

  <Link
    href={`/admin/banners/${banner.id}`}
    className="
px-5
py-3
rounded-xl
font-semibold
text-white
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
hover:scale-105
hover:shadow-[0_0_20px_rgba(236,72,153,.35)]
transition-all
duration-300
"
  >
    Edit
  </Link>

  <button
    onClick={() =>
      deleteBanner(banner.id)
    }
    className="
flex-1
md:flex-none
px-5
py-3
rounded-xl
border
border-red-500
text-red-400
font-semibold
hover:bg-red-500
hover:text-white
transition-all
duration-300
">
    Delete
  </button>

</div>

        </div>

      ))}

    </div>
  )
}