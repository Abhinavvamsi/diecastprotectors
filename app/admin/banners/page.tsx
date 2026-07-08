import Link from "next/link"
import { prisma } from "@/lib/prisma"
import BannerList from "@/components/banner-list"
import AdminNav from "@/components/admin-nav"
import { requireAdmin } from "@/lib/admin"

export default async function BannerPage() {

  await requireAdmin()

  const banners = await prisma.banner.findMany({
    orderBy: {
      order: "asc",
    },
  })

  return (
    <main className="min-h-screen bg-[#09090B] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <AdminNav />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
          <div>
           <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
              Banner Management
            </h1>

            <p className="text-zinc-400">
              Manage homepage banners, upload desktop/mobile images and arrange their display order.
            </p>
          </div>

          <Link
            href="/admin/banners/new"
            className="
h-14
px-8
rounded-xl
font-semibold
text-white
flex
items-center
justify-center
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
transition-all
duration-300
"
          >
            + Add Banner
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-6">
          {banners.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎨</div>

              <h2 className="text-2xl font-bold">
                No Banners Found
              </h2>

              <p className="text-zinc-400 mt-2">
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