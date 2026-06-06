"use client"

import Link from "next/link"

export default function AdminNav() {

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
      href: "/admin/coupons",
      label: "Coupons",
    },

    {
      href: "/admin/settings",
      label: "Settings",
    },

  ]

  return (

    <div className="flex flex-wrap gap-3 mb-12 mt-6">

      {links.map((link) => (

        <Link
          key={link.href}
          href={link.href}
        >

          <button
            className="
            px-5
            py-3
            rounded-xl
            bg-zinc-900
            border
            border-zinc-800
            hover:border-red-500
            hover:text-red-500
            transition
            "
          >

            {link.label}

          </button>

        </Link>

      ))}

    </div>

  )

}