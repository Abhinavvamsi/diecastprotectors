"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { toast } from "sonner"

type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number

  quantityPricing?: {
    quantity: string
    price: string
  }[]

  badge?: string | null
}
export default function EditProductForm({
  product,
}: {
  product: Product
}) {

  const router =
    useRouter()

  const [name, setName] =
    useState(product.name)

  const [
    description,
    setDescription,
  ] = useState(
    product.description
  )

  const [price, setPrice] =
    useState(product.price)

  const [images, setImages] =
    useState<string[]>(
      product.images || []
    )

  const [category, setCategory] =
    useState(product.category)

  const [stock, setStock] =
    useState(product.stock)
  
  const [
  quantityPricing,
  setQuantityPricing,
] = useState(
  product.quantityPricing || []
)
const [uploading, setUploading] =
  useState(false)

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

  } catch {

    toast.error(
      "Upload failed"
    )

  } finally {

    setUploading(false)

  }

}

  async function handleUpdate() {

    const response =
      await fetch(
        `/api/update-product?id=${product.id}`,
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
  stock,

  quantityPricing,

}),

        }
      )

    if (response.ok) {

      toast.success(
        "Product Updated 🚀"
      )

      router.push(
        "/admin/products"
      )

      router.refresh()

    } else {

      toast.error(
        "Failed to update"
      )

    }

  }

 return (

  <div
    className="
    bg-white
    border
    border-gray-200
    shadow-sm
    rounded-3xl
    p-8
    space-y-6
    "
  >

    {/* Name */}
    <input
      type="text"
      value={name}
      onChange={(e) =>
        setName(e.target.value)
      }
      className="
      w-full
      h-14
      rounded-xl
      bg-white
      border
      border-gray-300
      px-4
      text-black
      outline-none
      focus:border-[#D4AF37]
      "
    />

    {/* Description */}
    <textarea
      value={description}
      onChange={(e) =>
        setDescription(
          e.target.value
        )
      }
      className="
      w-full
      min-h-[180px]
      rounded-xl
      bg-white
      border
      border-gray-300
      px-4
      py-4
      text-black
      outline-none
      focus:border-[#D4AF37]
      "
    />

    {/* Price */}
    <input
      type="number"
      value={price}
      onChange={(e) =>
        setPrice(
          Number(e.target.value)
        )
      }
      className="
      w-full
      h-14
      rounded-xl
      bg-white
      border
      border-gray-300
      px-4
      text-black
      outline-none
      focus:border-[#D4AF37]
      "
    />

    {/* Product Images */}
    <div className="space-y-4">

      <label
        className="
        text-sm
        text-gray-500
        uppercase
        "
      >

        Product Images

      </label>

      <label
        className="
        flex
        items-center
        justify-center
        h-40
        rounded-2xl
        border-2
        border-dashed
        border-gray-300
        bg-gray-50
        cursor-pointer
        hover:border-[#D4AF37]
        transition
        "
      >

        <span className="text-black font-medium">

          Upload Images

        </span>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

      </label>

      {uploading && (

        <p className="text-[#D4AF37]">

          Uploading...

        </p>

      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        {images.map((img) => (

          <div
            key={img}
            className="
            relative
            bg-gray-50
            border
            border-gray-200
            rounded-xl
            p-2
            "
          >

            <img
              src={img}
              alt="Preview"
              className="
              w-full
              h-40
              object-contain
              "
            />

            <button
              type="button"
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
              top-2
              right-2
              w-8
              h-8
              rounded-full
              bg-red-500
              text-white
              "
            >

              ×

            </button>

          </div>

        ))}

      </div>

    </div>

    {/* Category */}
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
      rounded-xl
      bg-white
      border
      border-gray-300
      px-4
      text-black
      outline-none
      focus:border-[#D4AF37]
      "
    >

      <option value="Protectors">
        Protectors
      </option>

      <option value="Cars">
        Cars
      </option>

    </select>

    {/* Quantity Pricing */}
   <div className="space-y-4">

  <div className="flex items-center justify-between">

    <label
      className="
      text-sm
      text-gray-500
      uppercase
      tracking-wider
      "
    >
      Quantity Pricing
    </label>

    <button
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
      className="
      h-10
      px-4
      rounded-xl
      bg-[#D4AF37]
      text-black
      font-semibold
      hover:bg-[#B8941F]
      transition
      "
    >
      + Add Tier
    </button>

  </div>

  {quantityPricing.map(
    (tier, index) => (

      <div
        key={index}
        className="flex gap-3"
      >

        <input
          type="number"
          value={tier.quantity}
          placeholder="Quantity"
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
          rounded-xl
          bg-white
          border
          border-gray-300
          px-4
          text-black
          "
        />

        <input
          type="number"
          value={tier.price}
          placeholder="Price"
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
          rounded-xl
          bg-white
          border
          border-gray-300
          px-4
          text-black
          "
        />

        <button
          type="button"
          onClick={() =>
            setQuantityPricing(
              quantityPricing.filter(
                (_, i) => i !== index
              )
            )
          }
          className="
          h-14
          px-4
          rounded-xl
          bg-red-500
          text-white
          hover:bg-red-600
          "
        >
          ✕
        </button>

      </div>

    )
  )}

</div>

    {/* Stock */}
    <input
      type="number"
      placeholder="Stock Quantity"
      value={stock}
      onChange={(e) =>
        setStock(
          Number(
            e.target.value
          )
        )
      }
      className="
      w-full
      h-14
      rounded-xl
      bg-white
      border
      border-gray-300
      px-4
      text-black
      outline-none
      focus:border-[#D4AF37]
      "
    />

    {/* Update Button */}
    <button
      onClick={handleUpdate}
      className="
      w-full
      h-14
      rounded-xl
      bg-[#D4AF37]
      text-black
      font-bold
      hover:bg-[#B8941F]
      transition
      "
    >

      Update Product

    </button>

  </div>

)

}