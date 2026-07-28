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
  reservedStock?: number

  quantityPricing?: {
    quantity: string
    price: string
  }[]

  badge?: string | null
  isPreOrder?: boolean
	  depositAmount?: number
	  expectedArrival?: string | null
	  preOrderDeadline?: string | null
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
  const [reservedStock, setReservedStock] =
    useState(product.reservedStock || 0)
  const [isPreOrder, setIsPreOrder] =
    useState(product.isPreOrder || false)
  const [depositAmount, setDepositAmount] =
    useState(product.depositAmount ?? 50)
	  const [expectedArrival, setExpectedArrival] =
	    useState(product.expectedArrival || "")
	  const [preOrderDeadline, setPreOrderDeadline] =
	    useState(product.preOrderDeadline || "")

	  const todayDate =
	    new Date().toLocaleDateString(
	      "en-CA",
	      {
	        timeZone: "Asia/Kolkata",
	      }
	    )
  
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
  reservedStock,
  isPreOrder,
	  depositAmount: Number(depositAmount || 50),
	  expectedArrival,
	  preOrderDeadline,
	
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
bg-zinc-900
border
border-zinc-800
shadow-2xl
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
      bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
      px-4
      outline-none
      "
      />

    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Total Stock
        </label>
        <input
          type="number"
          min={0}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          className="
          w-full
          h-14
          rounded-xl
          bg-zinc-950
          border-zinc-700
          text-white
          focus:border-pink-500
          focus:ring-2
          focus:ring-pink-500/30
          transition-all
          px-4
          outline-none
          "
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Reserved Stock
        </label>
        <input
          type="number"
          min={0}
          max={stock}
          value={reservedStock}
          onChange={(e) =>
            setReservedStock(Number(e.target.value))
          }
          className="
          w-full
          h-14
          rounded-xl
          bg-zinc-950
          border-zinc-700
          text-white
          focus:border-pink-500
          focus:ring-2
          focus:ring-pink-500/30
          transition-all
          px-4
          outline-none
          "
        />
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4">
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

      <div>
        <label className="mb-2 block text-sm text-zinc-400">
          Deposit % or ₹ amount
        </label>
        <input
          type="number"
          min={1}
          value={depositAmount}
          onChange={(e) =>
            setDepositAmount(Number(e.target.value))
          }
          className="w-full h-14 rounded-xl bg-zinc-950 border-zinc-700 text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition-all px-4 outline-none"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Use 1-100 for percentage. Use a value above 100 for a fixed rupee deposit, like 600 or 1000.
        </p>
      </div>

	      <div>
	        <label className="mb-2 block text-sm text-zinc-400">
	          Expected Arrival
        </label>
        <input
          type="text"
          value={expectedArrival}
          onChange={(e) =>
            setExpectedArrival(e.target.value)
          }
	          className="w-full h-14 rounded-xl bg-zinc-950 border-zinc-700 text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition-all px-4 outline-none"
	        />
	      </div>

	      <div>
	        <label className="mb-2 block text-sm text-zinc-400">
	          Accepting Pre-Orders Until
	        </label>
	        <input
	          type="date"
	          min={todayDate}
	          value={preOrderDeadline}
	          onChange={(e) =>
	            setPreOrderDeadline(e.target.value)
	          }
	          className="w-full h-14 rounded-xl bg-zinc-950 border-zinc-700 text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/30 transition-all px-4 outline-none [color-scheme:dark]"
	        />
	        <p className="mt-2 text-xs text-zinc-500">
	          Optional. Public pre-order listings hide this item after this date.
	        </p>
	      </div>
	    </div>

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
      bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
      px-4
      py-4
      
      outline-none
      
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
     bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
      px-4
      
      outline-none
      
      "
    />

    {/* Product Images */}
    <div className="space-y-4">

      <label
        className="
        text-sm
        text-zinc-400
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
        border-zinc-700
bg-zinc-950
hover:border-pink-500
hover:bg-pink-500/5
        cursor-pointer
        transition
        "
      >

        <span className="text-white font-medium">

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

        <p className="text-pink-400">

          Uploading...

        </p>

      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

        {images.map((img) => (

          <div
            key={img}
            className="
            relative
            bg-zinc-950
border-zinc-700
            border
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
      bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
      px-4
      
      outline-none
      
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
      bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
hover:scale-105
hover:shadow-[0_0_25px_rgba(236,72,153,.35)]
transition-all
duration-300
      font-semibold
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
        className="flex flex-col md:flex-row gap-3"
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
          bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
          px-4
          
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
          bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
          px-4
          
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
          bg-gradient-to-r
from-pink-500
to-purple-600
text-white
hover:scale-105
hover:shadow-[0_0_20px_rgba(236,72,153,.35)]
transition-all
duration-300
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
     bg-zinc-950
border-zinc-700
text-white
placeholder:text-zinc-500
focus:border-pink-500
focus:ring-2
focus:ring-pink-500/30
transition-all
      px-4
      
      outline-none
     
      "
    />

    {/* Update Button */}
    <button
      onClick={handleUpdate}
      className="
      w-full
      h-14
      rounded-xl
      bg-gradient-to-r
from-pink-500
via-fuchsia-500
to-purple-600
text-white
transition-all
duration-300
hover:scale-[1.02]
hover:shadow-[0_0_40px_rgba(236,72,153,.45)]
active:scale-95
      font-bold
      "
    >

      Update Product

    </button>

  </div>

)

}
