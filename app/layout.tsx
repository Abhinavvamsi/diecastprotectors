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

export const metadata = {

  title: "Diecast Universe",

  description: "Premium Diecast Collectibles",

  icons: {

    icon: "/logo.png",

    shortcut: "/logo.png",

    apple: "/logo.png",

  },

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
  title: "Diecast Universe",
  description:
    "Premium Diecast Collectibles",
  url:
    "https://diecastprotectors.in",
  siteName:
    "Diecast Universe",

  images: [
    {
      url: "/logo.png",
      width: 512,
      height: 512,
      alt: "Diecast Universe",
    },
  ],

  locale: "en_IN",
  type: "website",
},
twitter: {
  card: "summary_large_image",
  title: "Diecast Universe",
  description:
    "Premium Diecast Collectibles",
  images: ["/logo.png"],
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