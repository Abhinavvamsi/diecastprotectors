"use client"

import { useState, useEffect } from "react"
import AdminNav from "@/components/admin-nav"
import { Button } from "@/components/ui/button"

import { toast } from "sonner"

import {
  useUser,
} from "@clerk/nextjs"

import { useRouter } from "next/navigation"

export default function AddProductPage() {

  const { user, isLoaded } =
    useUser()

  const router = useRouter()

  useEffect(() => {

    if (!isLoaded) return

    const isAdmin =
      user?.primaryEmailAddress
        ?.emailAddress ===
      "abhinavvamsi2004@gmail.com"

    if (!isAdmin) {

      router.push("/")

    }

  }, [user, isLoaded, router])

  const [name, setName] =
    useState("")

  const [description,
    setDescription
  ] = useState("")

  const [price, setPrice] =
    useState("")

  const [images, setImages] =
    useState<string[]>([])

  const [uploading,
    setUploading
  ] = useState(false)

  const [category,
    setCategory
  ] = useState("")

  const [badge, setBadge] =
    useState("")

  const [stock, setStock] =
    useState("")

  const [quantityPricing,
  setQuantityPricing
] = useState([
  {
    quantity: "",
    price: "",
  },
])

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      e.target.files?.[0]

    if (!file) return

    try {

      setUploading(true)

      const formData =
        new FormData()

      formData.append(
        "file",
        file
      )

      const response =
        await fetch(
          "/api/upload-image",
          {
            method: "POST",
            body: formData,
          }
        )

      const data =
        await response.json()

      setImages((prev) => [
        ...prev,
        data.imageUrl,
      ])

      toast.success(
        "Image uploaded 🚀"
      )

    } catch (error) {

      toast.error(
        "Upload failed"
      )

    } finally {

      setUploading(false)

    }

  }

  async function handleAddProduct() {

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !stock ||
      images.length === 0
    ) {

      toast.error(
        "Please fill all fields"
      )

      return

    }

    const response =
      await fetch(
        "/api/add-product",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            name,

  description,

  price: Number(price),

  images,

  category,

  badge,

  stock: Number(stock),

  quantityPricing,

          }),

        }
      )

    if (response.ok) {

      toast.success(
        "Product Added 🚀"
      )

      setName("")
      setDescription("")
      setPrice("")
      setImages([])
      setCategory("")
      setBadge("")
      setStock("")

    } else {

      toast.error(
        "Failed to add product"
      )

    }

  }

  return (

    <main className="min-h-screen bg-black text-white p-6 md:p-8">

      <div className="max-w-4xl mx-auto">

  <AdminNav />
        {/* Header */}
        <div className="mb-12">

          <p className="text-red-500 uppercase tracking-[0.3em] text-sm">

            Admin Dashboard

          </p>

          <h1 className="text-5xl md:text-6xl font-bold mt-4">

            Add Product

          </h1>

        </div>

        {/* Form */}
        <div
          className="
          bg-gradient-to-b
          from-zinc-900
          to-zinc-950
          border
          border-zinc-800
          rounded-[2rem]
          p-6
          md:p-10
          space-y-8
          shadow-2xl
          "
        >

          {/* Product Name */}
          <div className="space-y-3">

            <label className="text-sm text-zinc-400 uppercase tracking-wider">

              Product Name

            </label>

            <input
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="
              w-full
              h-14
              rounded-2xl
              bg-black
              border
              border-zinc-800
              px-5
              text-white
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/20
              transition-all
              "
            />

          </div>

          {/* Description */}
          <div className="space-y-3">

            <label className="text-sm text-zinc-400 uppercase tracking-wider">

              Description

            </label>

            <textarea
              placeholder="Write product description..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="
              w-full
              rounded-2xl
              bg-black
              border
              border-zinc-800
              px-5
              py-5
              min-h-[180px]
              text-white
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/20
              transition-all
              "
            />

          </div>

          {/* Price */}
          <div className="space-y-3">

            <label className="text-sm text-zinc-400 uppercase tracking-wider">

              Price

            </label>

            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
              className="
              w-full
              h-14
              rounded-2xl
              bg-black
              border
              border-zinc-800
              px-5
              text-white
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/20
              transition-all
              "
            />

          </div>

          {/* Image Upload */}
          <div className="space-y-4">

            <label className="text-sm text-zinc-400 uppercase tracking-wider">

              Product Images

            </label>

            <label
              className="
              flex
              items-center
              justify-center
              w-full
              h-44
              rounded-3xl
              border-2
              border-dashed
              border-zinc-700
              bg-black
              cursor-pointer
              hover:border-red-500
              hover:bg-zinc-950
              transition-all
              duration-300
              "
            >

              <div className="text-center">

                <p className="text-2xl font-bold text-white">

                  Upload Product Images

                </p>

                <p className="text-zinc-500 mt-3">

                  Click to browse images

                </p>

              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

            </label>

            {uploading && (

              <p className="text-red-500">

                Uploading image...

              </p>

            )}

            {/* Preview */}
            {images.length > 0 && (

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {images.map((img) => (

                  <div
                    key={img}
                    className="relative"
                  >

                    <img
                      src={img}
                      alt="Preview"
                      className="
                      w-full
                      h-48
                      object-cover
                      rounded-2xl
                      border
                      border-zinc-800
                      "
                    />

                    <button
                      onClick={() =>
                        setImages(
                          images.filter(
                            (image) =>
                              image !== img
                          )
                        )
                      }
                      className="
                      absolute
                      top-3
                      right-3
                      w-9
                      h-9
                      rounded-full
                      bg-red-500
                      hover:bg-red-600
                      text-white
                      text-lg
                      font-bold
                      transition
                      "
                    >

                      ×

                    </button>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* Category */}
          <div className="space-y-3">

            <label className="text-sm text-zinc-400 uppercase tracking-wider">

              Category

            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="
              w-full
              h-14
              rounded-2xl
              bg-black
              border
              border-zinc-800
              px-5
              text-white
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/20
              transition-all
              "
            >

              <option value="">
                Select Category
              </option>

              <option value="Protectors">
                Protectors
              </option>

              <option value="Cars">
                Cars
              </option>

            </select>

          </div>

          {/* Badge */}
          <div className="space-y-3">

            <label className="text-sm text-zinc-400 uppercase tracking-wider">

              Product Badge

            </label>

            <select
              value={badge}
              onChange={(e) =>
                setBadge(e.target.value)
              }
              className="
              w-full
              h-14
              rounded-2xl
              bg-black
              border
              border-zinc-800
              px-5
              text-white
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/20
              transition-all
              "
            >

              <option value="">
                No Badge
              </option>

              <option value="PREMIUM">
                PREMIUM
              </option>

              <option value="LIMITED">
                LIMITED
              </option>

              <option value="BESTSELLER">
                BESTSELLER
              </option>

              <option value="NEW">
                NEW
              </option>

            </select>

          </div>
<div className="space-y-4">

  <label className="text-sm text-zinc-400 uppercase tracking-wider">

    Quantity Pricing

  </label>

  {quantityPricing.map(
  (item, index) => (

    <div
      key={index}
      className="flex gap-3 items-center"
    >

        <input
          type="number"
          placeholder="Quantity"
          value={item.quantity}
          onChange={(e) => {

            const updated =
              [...quantityPricing]

            updated[index]
              .quantity =
              e.target.value

            setQuantityPricing(
              updated
            )

          }}
          className="
          flex-1
          h-14
          rounded-2xl
          bg-black
          border
          border-zinc-800
          px-5
          "
        />

        <input
  type="number"
  placeholder="Price"
  value={item.price}
  onChange={(e) => {

    const updated =
      [...quantityPricing]

    updated[index]
      .price =
      e.target.value

    setQuantityPricing(
      updated
    )

  }}
  className="
  flex-1
  h-14
  rounded-2xl
  bg-black
  border
  border-zinc-800
  px-5
  "
/>

<button
  type="button"
  onClick={() => {

    setQuantityPricing(
      quantityPricing.filter(
        (_, i) => i !== index
      )
    )

  }}
  disabled={
    quantityPricing.length === 1
  }
  className="
  h-14
  px-4
  rounded-2xl
  bg-red-500
  hover:bg-red-600
  text-white
  font-bold
  disabled:opacity-50
  disabled:cursor-not-allowed
  "
>

  Remove

</button>

</div>
    )
  )}

  <Button
    type="button"
    onClick={() =>
      setQuantityPricing([
        ...quantityPricing,
        {
          quantity: "",
          price: "",
        },
      ])
    }
  >

    Add Tier

  </Button>

</div>
          {/* Stock */}
          <div className="space-y-3">

            <label className="text-sm text-zinc-400 uppercase tracking-wider">

              Stock Quantity

            </label>

            <input
              type="number"
              placeholder="Enter stock quantity"
              value={stock}
              onChange={(e) =>
                setStock(
                  e.target.value
                )
              }
              className="
              w-full
              h-14
              rounded-2xl
              bg-black
              border
              border-zinc-800
              px-5
              text-white
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/20
              transition-all
              "
            />

          </div>

          {/* Submit */}
          <Button
            onClick={
              handleAddProduct
            }
            className="
            w-full
            h-16
            rounded-2xl
            text-lg
            font-bold
            bg-red-500
            hover:bg-red-600
            hover:scale-[1.01]
            active:scale-95
            transition-all
            duration-300
            shadow-lg
            shadow-red-500/20
            hover:shadow-red-500/40
            "
          >

            Add Product

          </Button>

        </div>

      </div>

    </main>

  )

}