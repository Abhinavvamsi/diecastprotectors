"use client"

import Link from "next/link"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

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
    <section className="bg-white py-12 px-6">
      <div className="group relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border-2 border-gray-200 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_50px_rgba(212,175,55,0.45)]">
        <div className="absolute inset-0 rounded-[32px] border-2 border-transparent pointer-events-none transition-all duration-500 group-hover:border-[#D4AF37] group-hover:shadow-[inset_0_0_30px_rgba(212,175,55,0.5),0_0_40px_rgba(212,175,55,0.4)]" />
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={1}
          loop
          speed={800}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            nextEl: ".prev-btn",
            prevEl: ".next-btn",
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
          className="h-[650px] rounded-[32px]"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative h-full">

                {/* Desktop */}
                <img
                  src={banner.images.desktop}
                  alt={banner.title}
                  className="hidden h-full w-full object-cover md:block"
                />

                {/* Mobile */}
                <img
                  src={banner.images.mobile}
                  alt={banner.title}
                  className="block h-full w-full object-cover md:hidden"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 z-10 flex items-center transition-all duration-700 group-hover:translate-x-2">
                  <div className="max-w-xl px-10 md:px-16">

                    <div className="mb-5 inline-flex rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/20 px-4 py-2 text-sm font-semibold text-[#D4AF37]">
                      PREMIUM COLLECTION
                    </div>

                    <h1 className="text-5xl font-black text-white md:text-7xl">
                      {banner.title}
                    </h1>

                    {banner.subtitle && (
                      <p className="mt-6 text-lg text-gray-200">
                        {banner.subtitle}
                      </p>
                    )}

                    {banner.buttonText && (
                      <Link href={banner.buttonLink || "#"}>
                        <button className="mt-8 rounded-xl bg-[#D4AF37] px-8 py-4 font-bold text-black transition-all duration-300 hover:bg-[#c89f25] hover:scale-105 hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] active:scale-95">
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
          className="prev-btn hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white transition-all duration-300 hover:scale-110 hover:bg-[#D4AF37] hover:text-black active:scale-95"
        >
          ←
        </button>

        {/* Next */}
        <button
          className="next-btn hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white transition-all duration-300 hover:scale-110 hover:bg-[#D4AF37] hover:text-black active:scale-95"
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
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.35s ease;
          border-radius: 9999px;
        }

        .swiper-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.8);
        }

        .swiper-pagination-bullet-active {
          width: 34px;
          background: #d4af37;
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