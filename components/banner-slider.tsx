"use client"

import Link from "next/link"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import {
  getBannerDesktopUrl,
  getBannerMobileUrl,
} from "@/lib/cloudinary-url"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

type Banner = {
  id: string
  title: string
  subtitle?: string
  images: {
    desktop: string
    mobile: string
  }
  buttonText?: string
  buttonLink?: string
  order: number
  active: boolean
}

interface BannerSliderProps {
  banners: Banner[]
}

export default function BannerSlider({
  banners,
}: BannerSliderProps) {
  if (!banners.length) return null

  return (
    <section className="bg-[#09090B] py-12 px-6">

     <div
  className={`
    group
    relative
    mx-auto
    max-w-7xl
    overflow-hidden
    rounded-[32px]
    border-2
    border-zinc-800
    shadow-2xl
    transition-all
    duration-500
    hover:-translate-y-2
    hover:border-pink-500/60
    hover:shadow-[0_0_60px_rgba(236,72,153,.35)]
  `}
>

       <div
  className={`
    absolute
    inset-0
    rounded-[32px]
    border-2
    border-transparent
    pointer-events-none
    transition-all
    duration-500
    group-hover:border-pink-500/50
    group-hover:shadow-[inset_0_0_30px_rgba(236,72,153,.25),0_0_45px_rgba(236,72,153,.3)]
  `}
/>
        <Swiper
          modules={[
            Navigation,
            Pagination,
            Autoplay,
          ]}
          slidesPerView={1}
          loop
          speed={800}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
  nextEl: ".next-btn",
  prevEl: ".prev-btn",
}}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            0: {
              allowTouchMove: true,
              simulateTouch: true,
              grabCursor: true,
            },
            768: {
              allowTouchMove: false,
              simulateTouch: false,
              grabCursor: false,
            },
          }}
         className="
h-[380px]
sm:h-[450px]
md:h-[650px]
rounded-[32px]
"
        >

          {banners.map((banner) => (

            <SwiperSlide key={banner.id}>

              <div className="relative h-full">

                <picture>
                  <source
                    media="(min-width: 768px)"
                    srcSet={getBannerDesktopUrl(
                      banner.images.desktop
                    )}
                  />
                  <source
                    media="(max-width: 767px)"
                    srcSet={getBannerMobileUrl(
                      banner.images.mobile
                    )}
                  />
                  <img
                    src={getBannerMobileUrl(banner.images.mobile)}
                    alt={banner.title}
                    loading={banner.order === 1 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </picture>

                {/* Overlay */}

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />

                {/* Content */}

                <div className="absolute inset-0 z-10 flex items-center transition-all duration-700 group-hover:translate-x-2">

                  <div className="max-w-xl px-10 md:px-16">

                    <div
  className={`
    mb-5
    inline-flex
    rounded-full
    border
    border-pink-500/40
    bg-pink-500/15
    px-4
    py-2
    text-sm
    font-semibold
    bg-gradient-to-r
    from-pink-500
    via-fuchsia-500
    to-purple-500
    bg-clip-text
    text-transparent
  `}
>

                      PREMIUM COLLECTION

                    </div>

                    <h1 className="text-5xl font-black text-white md:text-7xl">

                      {banner.title}

                    </h1>

                    {banner.subtitle && (

                      <p className="mt-6 text-lg text-zinc-300">

                        {banner.subtitle}

                      </p>

                    )}

                    {banner.buttonText && (

                      <Link
                        href={
                          banner.buttonLink ||
                          "#"
                        }
                      >

                       <button
  className={`
    mt-8
    rounded-xl
    px-8
    py-4
    font-bold
    text-white
    bg-gradient-to-r
    from-pink-500
    via-fuchsia-500
    to-purple-600
    transition-all
    duration-300
    hover:scale-105
    hover:shadow-[0_0_30px_rgba(236,72,153,.45)]
    active:scale-95
  `}
>

                          {banner.buttonText}

                        </button>

                      </Link>

                    )}

                  </div>

                </div>

              </div>

            </SwiperSlide>

          ))}

        </Swiper>

        {/* Previous */}

       <button
  className={`
    prev-btn
    hidden
    md:flex
    absolute
    left-2
    top-1/2
    -translate-y-1/2
    z-20
    h-12
    w-12
    items-center
    justify-center
    rounded-full
    bg-black/40
    backdrop-blur-xl
    border
    border-zinc-700
    text-white
    transition-all
    duration-300
    hover:scale-110
    hover:bg-gradient-to-r
    hover:from-pink-500
    hover:to-purple-600
    hover:border-transparent
    active:scale-95
  `}
>
  ←
</button>

        {/* Next */}

       <button
  className={`
    next-btn
    hidden
    md:flex
    absolute
    right-2
    top-1/2
    -translate-y-1/2
    z-20
    h-12
    w-12
    items-center
    justify-center
    rounded-full
    bg-black/40
    backdrop-blur-xl
    border
    border-zinc-700
    text-white
    transition-all
    duration-300
    hover:scale-110
    hover:bg-gradient-to-r
    hover:from-pink-500
    hover:to-purple-600
    hover:border-transparent
    active:scale-95
  `}
>
  →
</button>

      </div>

      <style jsx global>{`
        .swiper {
          overflow: hidden;
        }

        .swiper-slide {
          user-select: none;
        }

        .swiper-pagination {
          bottom: 22px !important;
        }

        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.4);
          opacity: 1;
          transition: all 0.35s ease;
          border-radius: 9999px;
        }

        .swiper-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.8);
        }

        .swiper-pagination-bullet-active {
          width: 34px;
          background: linear-gradient(
            90deg,
            #ec4899,
            #d946ef,
            #9333ea
          );
        }

        .swiper-button-disabled {
          opacity: 0.4;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .swiper-pagination {
            bottom: 14px !important;
          }
        }
      `}</style>

    </section>
  )
}
