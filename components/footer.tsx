import Link from "next/link"
import Image from "next/image"
export default function Footer() {

  const whatsappGroupUrl =
    "https://chat.whatsapp.com/LXeocqm0ctA0ohmQSNfP0t?s=cl&p=a&ilr=1&amv=2"

  return (

    <footer className="border-t border-[#2B2B3A] bg-[#09090B] text-white mt-20">

      <div className="max-w-7xl mx-auto px-6 py-14 relative">

        <div className="grid md:grid-cols-3 gap-12">

          {/* Brand */}
          {/* Brand */}
<div>

  <div className="flex items-center gap-4">

    <Image
      src="/logo.png"
      alt="Shinsei Diecast"
      width={56}
      height={56}
      className="object-contain shrink-0 drop-shadow-[0_0_12px_rgba(236,72,153,0.6)]"
    />

    <div>

      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
        Shinsei Diecast
      </h2>

      <p className="text-xs tracking-[0.25em] uppercase text-zinc-400 mt-1">
        Premium Diecast Collection
      </p>

    </div>

  </div>

  <p className="mt-6 leading-relaxed text-gray-400">
    From Japan to your collection — premium diecast cars delivered with care.
  </p>

</div>

          {/* Quick Links */}
          <div>

            <h3 className="text-xl font-semibold mb-5">

              Quick Links

            </h3>

            <div className="flex flex-col gap-3 text-gray-600">

              <Link
  href="/"
  className="text-gray-400 hover:text-pink-400 transition-colors duration-300"
>
  Home
</Link>

              <Link
  href="/cars"
  className="text-gray-400 hover:text-pink-400 transition-colors duration-300"
>
  Browse Inventory
</Link>

              <Link
  href="/orders"
  className="text-gray-400 hover:text-pink-400 transition-colors duration-300"
>
  Order History
</Link>

            </div>

          </div>

          {/* Policies */}
          <div>

            <h3 className="text-xl font-semibold mb-5">

              Policies

            </h3>

            <div className="flex flex-col gap-3 text-gray-400">

              <Link
  href="/shipping-policy"
  className="hover:text-pink-400 transition-colors duration-300"
>

              Shipping & Dispatch Policy

              </Link>

              <Link href="/refund-policy"
              className="hover:text-pink-400 transition-colors duration-300">

                Returns & Refunds

              </Link>

              <Link href="/privacy-policy"
              className="hover:text-pink-400 transition-colors duration-300">

                Privacy Notice

              </Link>

              <Link href="/terms-and-conditions"
              className="hover:text-pink-400 transition-colors duration-300">

                Terms of Service

              </Link>

            </div>

          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-[#2B2B3A] mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">

          <p>

           © 2026 Shinsei Diecast. All rights reserved.

          </p>

          <div className="flex flex-col items-center md:items-end gap-3">
            <p>Inspired by JDM culture • Built for collectors</p>
            <a
              href={whatsappGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-green-400"
            >
              Join WhatsApp Community
            </a>
          </div>

        </div>

      </div>
<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
    </footer>

  )

} 
