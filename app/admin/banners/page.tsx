import Link from "next/link"
import { prisma } from "@/lib/prisma"
import BannerList from "@/components/banner-list"
import AdminNav from "@/components/admin-nav"

export default async function BannerPage() {
  const banners = await prisma.banner.findMany({
    orderBy: {
      order: "asc",
    },
  })

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNav />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              Banner Management
            </h1>

            <p className="text-gray-500">
              Manage homepage banners, upload desktop/mobile images and arrange their display order.
            </p>
          </div>

          <Link
            href="/admin/banners/new"
            className="
              h-14
              px-8
              rounded-xl
              bg-[#D4AF37]
              text-black
              font-semibold
              flex
              items-center
              justify-center
              hover:bg-[#c89f25]
              transition
              shadow-sm
            "
          >
            + Add Banner
          </Link>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-3xl p-6">
          {banners.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🖼️</div>

              <h2 className="text-2xl font-bold">
                No Banners Found
              </h2>

              <p className="text-gray-500 mt-2">
                Create your first homepage banner.
              </p>

              <Link
                href="/admin/banners/new"
                className="
                  inline-flex
                  mt-6
                  h-12
                  px-6
                  items-center
                  rounded-xl
                  bg-[#D4AF37]
                  text-black
                  font-semibold
                  hover:bg-[#c89f25]
                  transition
                "
              >
                + Create Banner
              </Link>
            </div>
          ) : (
            <BannerList
  initialBanners={banners.map((banner) => ({
    ...banner,
    subtitle: banner.subtitle ?? undefined,
    images: banner.images as {
      desktop: string
      mobile: string
    },
  }))}
/>
          )}
        </div>
      </div>
    </main>
  )
}