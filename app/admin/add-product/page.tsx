"use client"

import { useState, useEffect } from "react"
import AdminNav from "@/components/admin-nav"
import { Button } from "@/components/ui/button"

import { toast } from "sonner"



export default function AddProductPage() {

  

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

  const [isPreOrder, setIsPreOrder] =
    useState(false)

  const [depositAmount, setDepositAmount] =
    useState("50")

  const [expectedArrival, setExpectedArrival] =
    useState("")

  
  const [brandId, setBrandId] =
  useState("")

  const [brands, setBrands] =
  useState<any[]>([])

  useEffect(() => {

  async function loadBrands() {

    const response =
      await fetch(
        "/api/admin/brands"
      )

    const data =
      await response.json()

    setBrands(data)

  }

  loadBrands()

}, [])

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

  isPreOrder,

  depositAmount: Number(
    depositAmount || 50
  ),

  expectedArrival,

  brandId,

  stock: Number(stock),

  quantityPricing:
    quantityPricing.filter(
      (tier) =>
        tier.quantity.trim() !== "" &&
        tier.price.trim() !== ""
    ),

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
      setIsPreOrder(false)
      setDepositAmount("50")
      setExpectedArrival("")
      setQuantityPricing([
  {
    quantity: "",
    price: "",
  },
])

    } else {

      toast.error(
        "Failed to add product"
      )

    }

  }

  return (

    <main className="min-h-screen bg-[#09090B] text-white p-6 md:p-8">

      <div className="max-w-4xl mx-auto">

  <AdminNav />
        {/* Header */}
        <div className="mb-12">

          <p className="uppercase tracking-[0.3em] text-sm bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
  Shinsei Diecast Admin
</p>

        <h1 className="text-5xl md:text-6xl font-bold mt-4">
  Add New Product
</h1>

<p className="text-zinc-400 mt-3">
  Manage diecast cars, protectors and collectibles.
</p>

        </div>

        {/* Form */}
        <div
          className="
       bg-zinc-900
border
border-zinc-800
shadow-2xl
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
              bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
              px-5
              outline-none
              focus:ring-2
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
              bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
              px-5
              py-5
              min-h-[180px]
              outline-none
              focus:ring-2
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
              bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
              px-5
              outline-none
              focus:ring-2
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
              cursor-pointer
              bg-zinc-950
hover:border-pink-500
hover:bg-pink-500/5
              transition-all
              duration-300
              "
            >

              <div className="text-center">

                <p className="text-2xl font-bold text-white">

                  Upload Product Images

                </p>

                <p className="text-zinc-400 mt-3">

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

              <p className="text-pink-400">

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
                      object-contain
                      rounded-2xl
                      border
                      border-zinc-700
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
                      text-black
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
              bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
              px-5
              
              outline-none
              
              focus:ring-2
              
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

          {/* Pre-Order */}
          <div className="space-y-3">

            <label className="text-sm text-zinc-400 uppercase tracking-wider">
              Pre-Order
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4">
                <input
                  type="checkbox"
                  checked={isPreOrder}
                  onChange={(e) =>
                    setIsPreOrder(e.target.checked)
                  }
                />
                <span className="text-white font-medium">
                  Mark as preorder
                </span>
              </label>

              <input
                type="number"
                min={1}
                placeholder="Deposit % or ₹ amount"
                value={depositAmount}
                onChange={(e) =>
                  setDepositAmount(e.target.value)
                }
                className="w-full h-14 rounded-2xl bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-pink-500 focus:ring-pink-500/30 px-5 outline-none focus:ring-2 transition-all"
              />

              <p className="md:col-span-3 -mt-2 text-xs text-zinc-500">
                Enter 1-100 for percentage deposit. Enter any value above 100 for a fixed rupee deposit, like ₹600 or ₹1000.
              </p>

              <input
                type="text"
                placeholder="Expected arrival"
                value={expectedArrival}
                onChange={(e) =>
                  setExpectedArrival(e.target.value)
                }
                className="w-full h-14 rounded-2xl bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-pink-500 focus:ring-pink-500/30 px-5 outline-none focus:ring-2 transition-all"
              />
            </div>
          </div>

<div className="space-y-3">

  <label
    className="
    text-sm
    text-gray-500
    uppercase
    tracking-wider
    "
  >

    Brand

  </label>

  <select
    value={brandId}
    onChange={(e) =>
      setBrandId(
        e.target.value
      )
    }
    className="
    w-full
    h-14
    rounded-2xl
    bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
    px-5
    outline-none
    focus:ring-2
    "
  >

    <option value="">
      Select Brand
    </option>

    {brands.map((brand) => (

      <option
        key={brand.id}
        value={brand.id}
      >

        {brand.name}

      </option>

    ))}

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
              bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
              px-5
              outline-none
              focus:ring-2
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
          bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
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
  bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
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
  bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
  text-black
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
  className="
 bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
  "
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
             bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-pink-500/30
              px-5
             
              outline-none
              
              focus:ring-2
              
              transition-all
              "
            />

          </div>
<div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800">

  <h3 className="font-bold text-lg mb-4">
    Product Preview
  </h3>

  <p className="font-semibold">
    {name || "Product Name"}
  </p>

  <p className="text-pink-400 font-bold mt-2">
    ₹{price || "0"}
  </p>

  <p className="text-zinc-400 mt-2">
    {category || "Category"}
  </p>

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
            bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
hover:scale-[1.02]
hover:shadow-[0_0_40px_rgba(236,72,153,.45)]
            hover:scale-[1.01]
            active:scale-95
            transition-all
            duration-300
            shadow-lg
            "
          >

            Add Product

          </Button>

        </div>

      </div>

    </main>

  )

}
