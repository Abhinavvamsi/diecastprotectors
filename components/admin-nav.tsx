"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminNav() {

  const pathname = usePathname()

  const [role, setRole] =
    useState("")

  useEffect(() => {

    const cachedRole =
      localStorage.getItem("admin-role")

    if (cachedRole) {

      setRole(cachedRole)

    }

  }, [])

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

    ...(role === "OWNER"
  ? [
      {
        href: "/admin/admins",
        label: "Admins",
      },

      {
        href: "/admin/bulk-import",
        label: "Bulk Import",
      },
    ]
  : []),

    {
      href: "/admin/brands",
      label: "Brands",
    },

    {
      href: "/admin/banners",
      label: "Banners",
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

                ${
                  isActive
                    ? `
                      text-white
                      border-pink-500
                      bg-gradient-to-r
                      from-pink-500
                      via-fuchsia-500
                      to-purple-600
                      shadow-[0_0_25px_rgba(236,72,153,.35)]
                    `
                    : `
                      bg-zinc-900
                      text-zinc-300
                      border-zinc-700
                      hover:border-pink-500
                      hover:text-white
                      hover:-translate-y-1
                      hover:bg-zinc-800
                      hover:shadow-[0_0_20px_rgba(236,72,153,.15)]
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