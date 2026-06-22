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

export default function Navbar() {

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

  const isAdmin =
    user?.primaryEmailAddress
      ?.emailAddress ===
    "abhinavvamsi2004@gmail.com"

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
  border-b
  border-gray-200
  sticky
  top-0
  bg-white
  z-[999]
  shadow-sm
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
  alt="Diecast Universe"
  width={48}
  height={48}
  className="object-contain shrink-0"
/>

<div className="leading-none min-w-0">

  <p className="text-black text-lg md:text-xl font-bold tracking-wide truncate">
    DIECAST UNIVERSE
  </p>

  <p className="text-[#D4AF37] text-[10px] md:text-sm tracking-[0.2em] truncate">
    DIECAST COLLECTIBLES
  </p>

</div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-gray-700">

         

          <Link
            href="/cars"
            className="hover:text-[#D4AF37] transition"
          >

            Diecast Cars

          </Link>

          <Link
            href="/track-order"
            className="hover:text-[#D4AF37] transition"
          >

            Track Order

          </Link>

          <Link
            href="/orders"
            prefetch
            className="hover:text-[#D4AF37] transition"
          >

            My Orders

          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative hover:text-[#D4AF37] transition"
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
                  bg-[#D4AF37]
text-black
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
              className="text-[#D4AF37] font-semibold"
            >

              Admin

            </Link>

          )}

          {user ? (

            <UserButton />

          ) : (

            <SignInButton>

              <button className="hover:text-[#D4AF37] transition">

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
  className="text-black"
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
                  bg-[#D4AF37]
text-black
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
  className="text-black"
/>
            ) : (
              <Menu
  size={28}
  className="text-black"
/>
            )}

          </button>

        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (

        <div className="md:hidden border-t border-gray-200 bg-white text-black px-6 py-6 space-y-6">

        
          <Link
            href="/cars"
            className="block text-lg font-medium text-black"
          >

            Diecast Cars

          </Link>

          <Link
            href="/track-order"
            className="block text-lg font-medium text-black"
          >

            Track Order

          </Link>

          <Link
            href="/orders"
            className="block text-lg font-medium text-black"
          >

            My Orders

          </Link>

          {isAdmin && (

            <Link
              href="/admin"
              className="block text-lg text-[#D4AF37]"
            >

              Admin

            </Link>

          )}

          {user ? (

            <UserButton />

          ) : (

            <SignInButton>

              <button className="text-lg">

                Login

              </button>

            </SignInButton>

          )}

        </div>

      )}

    </nav>

  )

}