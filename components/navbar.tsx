"use client"

import Link from "next/link"

import Image from "next/image"

import { Search } from "lucide-react"

import {
  Menu,
  X,
  ShoppingCart,
} from "lucide-react"

import {
  useEffect,
  useState,
} from "react"



import {
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs"

import { useCartStore } from "@/store/cart-store"

const CARS_SCROLL_POSITION_KEY =
  "cars-scroll-position"

export default function Navbar() {

  const saveCarsScrollPosition = () => {
    if (window.location.pathname !== "/cars") return

    sessionStorage.setItem(
      CARS_SCROLL_POSITION_KEY,
      String(window.scrollY)
    )
  }

  const { user } = useUser()

  const cart =
    useCartStore(
      (state) => state.cart
    )

  const clearCart =
    useCartStore(
      (state) => state.clearCart
    )

  const [mobileMenuOpen,
    setMobileMenuOpen
  ] = useState(false)

  const [animateCart,
    setAnimateCart
  ] = useState(false)

  const [isAdmin, setIsAdmin] =
  useState(false)

  const [role, setRole] =
  useState("")

  /* Clear cart when account changes */
  useEffect(() => {

  if (user === undefined) {
    return
  }

  const storedUser =
    localStorage.getItem(
      "hw-shield-user"
    )

  const currentUser =
    user?.id || "guest"

  if (
    storedUser &&
    storedUser !== currentUser
  ) {

    clearCart()

  }

  localStorage.setItem(
    "hw-shield-user",
    currentUser
  )

}, [user, clearCart])
useEffect(() => {

  if (!user) {

    setIsAdmin(false)

    localStorage.removeItem("is-admin")

    return

  }

  // Show cached value immediately
  const cached =
    localStorage.getItem("is-admin")

  if (cached !== null) {

    setIsAdmin(
      cached === "true"
    )

  }

  async function checkAdmin() {

    try {

      const response =
        await fetch("/api/admin/me")

      const data =
        await response.json()

      setIsAdmin(data.isAdmin)

      setRole(
        data.role ?? ""
      )

      localStorage.setItem(
        "is-admin",
        String(data.isAdmin)
      )

      localStorage.setItem(
        "admin-role",
        data.role ?? ""
      )

    } catch (error) {

      console.error(error)

    }

  }

  const timer = setTimeout(
    () => {
      checkAdmin()
    },
    0
  )

  return () =>
    clearTimeout(timer)

}, [user])
  /* Cart animation */
  useEffect(() => {

    if (cart.length > 0) {

      setAnimateCart(true)

      const timer =
        setTimeout(() => {

          setAnimateCart(false)

        }, 400)

      return () =>
        clearTimeout(timer)

    }

  }, [cart.length])

  return (

    <nav
 className="
sticky
top-0
z-[999]
border-b
border-[#2B2B3A]
bg-[#0B0B12]/90
backdrop-blur-xl
shadow-lg
shadow-black/40
"
>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <Image
  src="/logo.png"
alt="Shinsei Diecast"
  width={48}
  height={48}
 className="object-contain shrink-0 drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]"
/>

<div className="leading-none min-w-0">

  <p className="text-white text-lg md:text-xl font-bold tracking-wide truncate">
    SHINSEI DIECAST
  </p>

 <p className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-[10px] md:text-sm tracking-[0.2em] truncate font-semibold">
    PREMIUM DIECAST COLLECTION
</p>

</div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-gray-300">

         

          <Link
            href="/cars"
            prefetch={true}
            className="hover:text-pink-400 transition"
          >

            Browse Inventory

          </Link>

          <Link
            href="/pre-orders"
            prefetch={true}
            className="animate-pulse text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.75)] transition hover:text-white"
          >

            Pre-Orders

          </Link>

          <Link
            href="/track-order"
            prefetch={true}
            className="hover:text-pink-400 transition"
          >

            Track Order

          </Link>

          <Link
            href="/orders"
            prefetch
            className="hover:text-pink-400 transition"
          >

            Order History

          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            prefetch={true}
            onNavigate={saveCarsScrollPosition}
            className="relative hover:text-pink-400 transition"
          >

            <div
              className={`
              relative
              transition-all
              duration-300
              ${animateCart
                ? "scale-125"
                : "scale-100"}
              `}
            >

              <ShoppingCart size={26} />

              {cart.length > 0 && (

                <span
                  className="
                  absolute
                  -top-2
                  -right-2
                  min-w-[20px]
                  h-5
                  px-1
                  rounded-full
                 bg-gradient-to-r
from-pink-500
to-purple-600
text-white
                  text-xs
                  font-bold
                  flex
                  items-center
                  justify-center
                  "
                >

                  {cart.length}

                </span>

              )}

            </div>

          </Link>

          {isAdmin && (

            <Link
              href="/admin"
              prefetch={true}
              className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold"
            >

              Admin

            </Link>

          )}

          {user ? (

            <UserButton />

          ) : (

            <SignInButton>

              <button className="hover:text-pink-400 transition">

                Login

              </button>

            </SignInButton>

          )}

          

        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-4">

          {/* Mobile Cart */}
          <Link
            href="/cart"
            prefetch={true}
            onNavigate={saveCarsScrollPosition}
            className="relative"
          >

            <div
              className={`
              relative
              transition-all
              duration-300
              ${animateCart
                ? "scale-125"
                : "scale-100"}
              `}
            >

              <ShoppingCart
  size={24}
  className="text-white"
/>

              {cart.length > 0 && (

                <span
                  className="
absolute
-top-2
-right-2
min-w-[18px]
h-5
px-1
rounded-full
bg-gradient-to-r
from-pink-500
to-purple-600
text-white
text-xs
font-bold
flex
items-center
justify-center
shadow-[0_0_12px_rgba(236,72,153,0.5)]
"
                >

                  {cart.length}

                </span>

              )}

            </div>

          </Link>

          

          <button
            onClick={() =>
              setMobileMenuOpen(
                !mobileMenuOpen
              )
            }
          >

            {mobileMenuOpen ? (
              <X
  size={28}
  className="text-white"
/>
            ) : (
              <Menu
  size={28}
  className="text-white"
  
/>
            )}

          </button>

        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (

        <div className="md:hidden border-t border-[#2B2B3A] bg-[#111118] text-white px-6 py-6 space-y-6">

        
          <Link
            href="/cars"
            className="block text-lg font-medium text-white"
          >

            Browse Inventory

          </Link>

          <Link
            href="/pre-orders"
            className="block text-lg font-medium text-pink-400 animate-pulse"
          >

            Pre-Orders

          </Link>

          <Link
            href="/track-order"
            className="block text-lg font-medium text-white"
          >

            Track Order

          </Link>

          <Link
            href="/orders"
            className="block text-lg font-medium text-white"
          >

            Order History

          </Link>

          {isAdmin && (

            <Link
              href="/admin"
              className="block text-lg bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
            >

              Admin

            </Link>

          )}

          {user ? (

            <UserButton />

          ) : (

            <SignInButton>

              <button className="text-lg hover:text-pink-400 transition">

                Login

              </button>

            </SignInButton>

          )}

        </div>

      )}

    </nav>

  )

}
