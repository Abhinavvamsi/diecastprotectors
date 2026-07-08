"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
type BannerFormProps = {
  mode?: "create" | "edit"
  bannerId?: string
}
export default function BannerForm({
  mode = "create",
  bannerId,
}: BannerFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")

  const [desktopImage, setDesktopImage] = useState("")
  const [mobileImage, setMobileImage] = useState("")

  const [buttonText, setButtonText] = useState("")
  const [buttonLink, setButtonLink] = useState("")

  const [order, setOrder] = useState(0)
  const [active, setActive] = useState(true)

  const [uploadingDesktop, setUploadingDesktop] =
    useState(false)

  const [uploadingMobile, setUploadingMobile] =
    useState(false)

  const desktopInputRef =
    useRef<HTMLInputElement>(null)

  const mobileInputRef =
    useRef<HTMLInputElement>(null)
useEffect(() => {
  if (mode !== "edit" || !bannerId) return

  async function loadBanner() {
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`)
      const data = await res.json()

      setTitle(data.title || "")
      setSubtitle(data.subtitle || "")

      setDesktopImage(data.images?.desktop || "")
      setMobileImage(data.images?.mobile || "")

      setButtonText(data.buttonText || "")
      setButtonLink(data.buttonLink || "")

      setOrder(data.order || 0)
      setActive(data.active)
    } catch {
      toast.error("Failed to load banner")
    }
  }

  loadBanner()
}, [mode, bannerId])
  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    const url =
  mode === "edit"
    ? `/api/admin/banners/${bannerId}`
    : "/api/admin/banners"

const method =
  mode === "edit"
    ? "PUT"
    : "POST"

const res = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title,
    subtitle,
    image: desktopImage,
    mobileImage,
    buttonText,
    buttonLink,
    order,
    active,
  }),
})

    if (res.ok) {
      toast.success(
  mode === "edit"
    ? "Banner Updated"
    : "Banner Created"
)
      router.push("/admin/banners")
    } else {
      toast.error("Failed to create banner")
    }
  }
async function handleDesktopUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    setUploadingDesktop(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) throw new Error()

    setDesktopImage(data.imageUrl)

    toast.success("Desktop image uploaded")
  } catch {
    toast.error("Upload failed")
  } finally {
    setUploadingDesktop(false)
  }
}

async function handleMobileUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    setUploadingMobile(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) throw new Error()

    setMobileImage(data.imageUrl)

    toast.success("Mobile image uploaded")
  } catch {
    toast.error("Upload failed")
  } finally {
    setUploadingMobile(false)
  }
}
  return (
    <main className="min-h-screen bg-[#09090B] text-white">

      <div className="max-w-6xl mx-auto px-6 py-12">

        <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
          Shinsei Diecast Admin
        </p>

        <h1 className="text-6xl font-bold text-white mt-3">
  {mode === "edit"
    ? "Edit Banner"
    : "Add New Banner"}
</h1>

        <form
          onSubmit={handleSubmit}
          className="
mt-12
rounded-3xl
border
border-zinc-800
bg-zinc-900
p-10
shadow-2xl
space-y-8
"
        >

          {/* Banner Title */}

<div>

  <label className="block text-zinc-400 uppercase text-sm mb-3">
    Banner Title
  </label>

  <input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Hot Wheels Premium Collection"
    required
    className="
w-full
rounded-2xl
bg-[#09090B]
border
border-zinc-700
px-5
py-4
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
focus:outline-none
transition
"
  />

</div>

{/* Subtitle */}

<div>

  <label className="block text-zinc-400 uppercase text-sm mb-3">
    Subtitle
  </label>

  <textarea
    value={subtitle}
    onChange={(e) => setSubtitle(e.target.value)}
    placeholder="Discover rare diecast collectibles..."
    rows={4}
    className="
w-full
rounded-2xl
bg-[#09090B]
border
border-zinc-700
px-5
py-4
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
focus:outline-none
resize-none
transition
"
  />

</div>

<div className="grid md:grid-cols-2 gap-8">

  {/* Desktop Banner */}

  <div>

    <label className="block text-zinc-400 uppercase text-sm mb-3">
      Desktop Banner
    </label>

    <label
      htmlFor="desktop-upload"
      className="
      h-64
      rounded-3xl
      border-2
      border-dashed
      border-zinc-700
     hover:border-pink-500
hover:bg-pink-500/5
      transition
      cursor-pointer
      overflow-hidden
      flex
      items-center
      justify-center
      block
      "
    >

      {desktopImage ? (

        <img
          src={desktopImage}
          alt="Desktop Banner"
          className="w-full h-full object-cover"
        />

      ) : (

        <div className="text-center">

          <h3 className="text-xl font-bold text-white">
            Upload Desktop Banner
          </h3>

          <p className="mt-2 text-zinc-400">
            Recommended: 1920 × 700
          </p>

        </div>

      )}

    </label>

    <input
      id="desktop-upload"
      type="file"
      accept="image/*"
      hidden
      onChange={handleDesktopUpload}
    />

    {uploadingDesktop && (
      <p className="mt-2 text-pink-400">
        Uploading...
      </p>
    )}

  </div>

  {/* Mobile Banner */}

  <div>

    <label className="block text-zinc-400 uppercase text-sm mb-3">
      Mobile Banner
    </label>

    <label
      htmlFor="mobile-upload"
      className="
h-64
rounded-3xl
border-2
border-dashed
border-zinc-700
bg-zinc-900
hover:border-pink-500
hover:bg-zinc-800
transition
cursor-pointer
overflow-hidden
flex
items-center
justify-center
block
"
    >

      {mobileImage ? (

        <img
          src={mobileImage}
          alt="Mobile Banner"
          className="w-full h-full object-cover"
        />

      ) : (

        <div className="text-center">

          <h3 className="text-xl font-bold text-white">
            Upload Mobile Banner
          </h3>

          <p className="mt-2 text-zinc-500">
            Recommended: 900 × 1200
          </p>

        </div>

      )}

    </label>

    <input
      id="mobile-upload"
      type="file"
      accept="image/*"
      hidden
      onChange={handleMobileUpload}
    />

    {uploadingMobile && (
      <p className="mt-2 text-pink-400">
        Uploading...
      </p>
    )}

  </div>

</div>


{/* Button */}

<div className="grid md:grid-cols-2 gap-8">

  <div>

    <label className="block text-zinc-400 uppercase text-sm mb-3">
      Button Text
    </label>

    <input
      value={buttonText}
      onChange={(e) => setButtonText(e.target.value)}
      placeholder="Shop Now"
      className="
w-full
rounded-2xl
bg-[#09090B]
border
border-zinc-700
px-5
py-4
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
focus:outline-none
"
    />

  </div>

  <div>

    <label className="block text-zinc-400 uppercase text-sm mb-3">
      Button Link
    </label>

    <input
      value={buttonLink}
      onChange={(e) => setButtonLink(e.target.value)}
      placeholder="/cars"
      className="
w-full
rounded-2xl
bg-[#09090B]
border
border-zinc-700
px-5
py-4
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
focus:outline-none
"
    />

  </div>

</div>


{/* Order & Active */}

<div className="grid md:grid-cols-2 gap-8 items-end">

  <div>

    <label className="block text-zinc-400 uppercase text-sm mb-3">
      Display Order
    </label>

    <input
      type="number"
      value={order}
      onChange={(e) =>
        setOrder(Number(e.target.value))
      }
      className="
w-full
rounded-2xl
bg-[#09090B]
border
border-zinc-700
px-5
py-4
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/20
focus:outline-none
"
    />

  </div>

  <label className="flex items-center gap-4 cursor-pointer">

  <input
    type="checkbox"
    checked={active}
    onChange={() => setActive(!active)}
    className="
      w-6
      h-6
      accent-pink-500
      cursor-pointer
    "
  />

  <span className="text-lg font-semibold text-white">
    Active Banner
  </span>

</label>
</div>


<div className="flex justify-end">

  <button
    type="submit"
    className="
bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
font-semibold
px-8
py-4
rounded-2xl
hover:scale-105
hover:shadow-[0_0_30px_rgba(236,72,153,.35)]
transition-all
duration-300
"
  >
    Save Banner
  </button>

</div>

        </form>

      </div>

    </main>
  )
}