"use client"

import Link from "next/link"

import Image from "next/image"

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

    <nav className="border-b border-zinc-900 sticky top-0 backdrop-blur-xl bg-black/80 z-50">

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <Image
            src="/logo.png"
            alt="Diecast Protectors And Cars"
            width={58}
            height={58}
            className="object-contain"
          />

          <div className="leading-none">

            <p className="text-white text-xl font-bold tracking-wide">

              DIECAST

            </p>

            <p className="text-red-500 text-sm tracking-[0.3em]">

              PROTECTORS AND CARS

            </p>

          </div>

        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-zinc-300">

          <Link
            href="/protectors"
            className="hover:text-red-500 transition"
          >

            Protectors

          </Link>

          <Link
            href="/cars"
            className="hover:text-red-500 transition"
          >

            Diecast Cars

          </Link>

          <Link
            href="/track-order"
            className="hover:text-red-500 transition"
          >

            Track Order

          </Link>

          <Link
            href="/orders"
            className="hover:text-red-500 transition"
          >

            My Orders

          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative hover:text-red-500 transition"
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
                  bg-red-500
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
              className="text-red-500 font-semibold"
            >

              Admin

            </Link>

          )}

          {user ? (

            <UserButton />

          ) : (

            <SignInButton>

              <button className="hover:text-red-500 transition">

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

              <ShoppingCart size={24} />

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
                  bg-red-500
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

          

          <button
            onClick={() =>
              setMobileMenuOpen(
                !mobileMenuOpen
              )
            }
          >

            {mobileMenuOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}

          </button>

        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (

        <div className="md:hidden border-t border-zinc-800 bg-black px-6 py-6 space-y-6">

          <Link
            href="/protectors"
            className="block text-lg"
          >

            Protectors

          </Link>

          <Link
            href="/cars"
            className="block text-lg"
          >

            Diecast Cars

          </Link>

          <Link
            href="/track-order"
            className="block text-lg"
          >

            Track Order

          </Link>

          <Link
            href="/orders"
            className="block text-lg"
          >

            My Orders

          </Link>

          {isAdmin && (

            <Link
              href="/admin"
              className="block text-lg text-red-500"
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