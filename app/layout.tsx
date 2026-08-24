import { ClerkProvider } from "@clerk/nextjs"

import type {
  Metadata,
  Viewport,
} from "next"

import Script from "next/script"

import "./globals.css"

import { Toaster } from "sonner"

import {
  ThemeProvider,
} from "@/components/theme-provider"
import StoreAssistant from "@/components/store-assistant"
import InteractionFeedback from "@/components/interaction-feedback"

import {
  Bebas_Neue,
} from "next/font/google"

const bebas = Bebas_Neue({

  subsets: ["latin"],

  weight: "400",

})

const siteUrl = "https://www.shinseidiecast.com"
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Shinsei Diecast",
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Shinsei Diecast",
  url: siteUrl,
}

export const metadata: Metadata = {

  title: "Shinsei Diecast",

  description: "Premium Diecast Collectibles",

  metadataBase: new URL("https://www.shinseidiecast.com"),

  alternates: {
    canonical: "/",
  },

  icons: {

    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-48x48.png",
        type: "image/png",
        sizes: "48x48",
      },
      {
        url: "/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
    ],

    shortcut: "/favicon.ico",

    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],

  },

  manifest: "/manifest.webmanifest",

  keywords: [
    "Hot Wheels",
    "Collectible Cars",
    "Protectors",
    "Hot Wheels Protectors",
    "Mini GT",
    "Tomica",
    "Diecast Collection",
  ],

  openGraph: {
  title: "Shinsei Diecast",
  description:
    "Premium Diecast Collectibles",
  url:
    "https://www.shinseidiecast.com",
  siteName:
    "Shinsei Diecast",

  images: [
    {
      url: "/logo.png",
      width: 512,
      height: 512,
      alt: "Shinsei Diecast",
    },
  ],

  locale: "en_IN",
  type: "website",
  },
  twitter: {
  card: "summary_large_image",
  title: "Shinsei Diecast",
  description:
    "Premium Diecast Collectibles",
  images: ["/logo.png"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090B",
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

        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              organizationSchema,
              websiteSchema,
            ]),
          }}
        />

        {/* Clerk */}
        <ClerkProvider>

          {/* Theme */}
          <ThemeProvider>

            {/* App */}
            {children}

            <InteractionFeedback />

            <StoreAssistant />

            {/* Toasts */}
            <Toaster
              position="top-center"
              theme="dark"
              richColors
              closeButton
              offset={{
                top: "calc(env(safe-area-inset-top, 0px) + 16px)",
              }}
              mobileOffset={{
                top: "calc(env(safe-area-inset-top, 0px) + 86px)",
                right: "14px",
                left: "14px",
              }}
              toastOptions={{
                classNames: {
                  toast:
                    "border border-white/10 bg-[#101017] text-white shadow-[0_0_30px_rgba(236,72,153,0.18)]",
                  title:
                    "text-sm font-semibold tracking-wide",
                  description:
                    "text-sm text-zinc-200",
                  closeButton:
                    "bg-[#101017] text-white border-white/20",
                },
              }}
            />

          </ThemeProvider>

        </ClerkProvider>

      </body>

    </html>

  )

}
