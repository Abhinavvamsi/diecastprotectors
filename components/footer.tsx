import Link from "next/link"

export default function Footer() {

  return (

    <footer className="border-t border-gray-200 bg-white text-black mt-20">

      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>

            <h2 className="text-3xl font-bold">

              Diecast Universe

            </h2>

            <p className="text-[#D4AF37] mt-4 leading-relaxed">

              Premium Hot Wheels, Mini GT, Inno64 and collectible diecast models curated for passionate collectors.

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
  className="hover:text-[#D4AF37] transition-colors"
>
  Home
</Link>

              <Link
  href="/cars"
  className="hover:text-[#D4AF37] transition-colors"
>
  Diecast Cars
</Link>

              <Link
  href="/orders"
  className="hover:text-[#D4AF37] transition-colors"
>
  My Orders
</Link>

            </div>

          </div>

          {/* Policies */}
          <div>

            <h3 className="text-xl font-semibold mb-5">

              Policies

            </h3>

            <div className="flex flex-col gap-3 text-zinc-400">

              <Link href="/shipping-policy">

                Shipping Policy

              </Link>

              <Link href="/refund-policy">

                Refund Policy

              </Link>

              <Link href="/privacy-policy">

                Privacy Policy

              </Link>

              <Link href="/terms-and-conditions">

                Terms & Conditions

              </Link>

            </div>

          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">

          <p>

           © 2026 Diecast Universe. All rights reserved.

          </p>

          <p>

            Built for collectors ❤️

          </p>

        </div>

      </div>

    </footer>

  )

} 