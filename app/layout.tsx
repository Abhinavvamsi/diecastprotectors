import { ClerkProvider } from "@clerk/nextjs"

import type { Metadata } from "next"

import Script from "next/script"

import "./globals.css"

import { Toaster } from "sonner"

import {
  ThemeProvider,
} from "@/components/theme-provider"

import {
  Bebas_Neue,
} from "next/font/google"

const bebas = Bebas_Neue({

  subsets: ["latin"],

  weight: "400",

})

export const metadata: Metadata = {

  title:
    "Diecast Protectors | Premium Hot Wheels Protectors & Diecast Cars",

  description:
    "Shop premium Hot Wheels protectors, acrylic cases and collectible diecast cars for passionate collectors.",

  keywords: [
    "Hot Wheels",
    "Diecast Cars",
    "Protectors",
    "Hot Wheels Protectors",
    "Mini GT",
    "Tomica",
    "Diecast Collection",
  ],

  openGraph: {

    title:
      "Diecast Protectors and Cars",

    description:
      "Premium diecast cars and Hot Wheels protectors.",

    url:
      "https://diecastprotectors.in",

    siteName:
      "Diecast Protectors And Cars",

    locale:
      "en_IN",

    type:
      "website",

  },

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (

    <html
      lang="en"
      suppressHydrationWarning
    >

      <body
        className={bebas.className}
      >

        {/* Razorpay */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />

        {/* Clerk */}
        <ClerkProvider>

          {/* Theme */}
          <ThemeProvider>

            {/* App */}
            {children}

            {/* Toasts */}
            <Toaster
              position="top-right"
              richColors
              closeButton
            />

          </ThemeProvider>

        </ClerkProvider>

      </body>

    </html>

  )

}