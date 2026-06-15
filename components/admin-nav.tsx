"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminNav() {

  const pathname = usePathname()

  const links = [

    {
      href: "/admin",
      label: "Dashboard",
    },

    {
      href: "/admin/add-product",
      label: "Add Product",
    },

    {
      href: "/admin/orders",
      label: "Orders",
    },

    {
      href: "/admin/products",
      label: "Products",
    },
    {
  href: "/admin/brands",
  label: "Brands",
},
    {
      href: "/admin/coupons",
      label: "Coupons",
    },

    {
      href: "/admin/settings",
      label: "Settings",
    },

  ]

  return (

    <div className="flex flex-wrap gap-4 mb-12 mt-6">

      {links.map((link) => {

        const isActive =
          pathname === link.href

        return (

          <Link
            key={link.href}
            href={link.href}
          >

            <button
              className={`
              px-6
              py-3
              rounded-2xl
              font-semibold
              border
              transition-all
              duration-300
              shadow-sm

              ${
                isActive
                  ? `
                    bg-[#D4AF37]
                    text-black
                    border-[#D4AF37]
                    shadow-lg
                    shadow-[#D4AF37]/20
                  `
                  : `
                    bg-white
                    text-black
                    border-gray-200
                    hover:border-[#D4AF37]
                    hover:bg-[#FFFBEF]
                    hover:text-[#D4AF37]
                    hover:-translate-y-1
                    hover:shadow-md
                  `
              }
              `}
            >

              {link.label}

            </button>

          </Link>

        )

      })}

    </div>

  )

}