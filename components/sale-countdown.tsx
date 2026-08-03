"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

type SaleCountdownProps = {
  launchAt?: string | null
  onComplete?: () => void
  liveWindowMinutes?: number
}

function getTimeLeft(launchAt?: string | null) {
  const launchTime = new Date(
    launchAt || ""
  ).getTime()

  if (!Number.isFinite(launchTime)) {
    return null
  }

  const difference =
    launchTime - Date.now()

  if (difference <= 0) {
    return null
  }

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  )
  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  )
  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  )
  const seconds = Math.floor(
    (difference / 1000) % 60
  )

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

export default function SaleCountdown({
  launchAt,
  onComplete,
  liveWindowMinutes = 60,
}: SaleCountdownProps) {
  const [now, setNow] =
    useState(() => Date.now())
  const [timeLeft, setTimeLeft] =
    useState(() => getTimeLeft(launchAt))
  const [completed, setCompleted] =
    useState(false)

  useEffect(() => {
    setTimeLeft(getTimeLeft(launchAt))
    setCompleted(false)
  }, [launchAt])

  useEffect(() => {
    if (!launchAt) return

    const timer = setInterval(() => {
      setNow(Date.now())

      const next = getTimeLeft(launchAt)
      setTimeLeft(next)

      if (!next && !completed) {
        setCompleted(true)
        onComplete?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [launchAt, completed, onComplete])

  const units = useMemo(
    () =>
      timeLeft
        ? [
            ["Days", timeLeft.days],
            ["Hours", timeLeft.hours],
            ["Minutes", timeLeft.minutes],
            ["Seconds", timeLeft.seconds],
          ]
        : [],
    [timeLeft]
  )

  const launchTime = new Date(
    launchAt || ""
  ).getTime()
  const liveUntil =
    Number.isFinite(launchTime)
      ? launchTime +
        liveWindowMinutes * 60 * 1000
      : 0
  const saleIsLive =
    !timeLeft &&
    Number.isFinite(launchTime) &&
    now >= launchTime &&
    now <= liveUntil

  if (saleIsLive) {
    return (
      <section className="mx-auto max-w-7xl px-4 md:px-6 pt-5 pb-8">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-green-400/35 bg-gradient-to-br from-green-500/12 via-cyan-500/10 to-pink-500/10 p-6 md:p-8 shadow-[0_0_48px_rgba(34,197,94,.2)]"
          animate={{
            boxShadow: [
              "0 0 30px rgba(34,197,94,.18)",
              "0 0 65px rgba(34,211,238,.26)",
              "0 0 30px rgba(34,197,94,.18)",
            ],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-green-400/20 blur-[70px]" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-cyan-500/20 blur-[80px]" />

          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-green-300">
                Sale Is Live
              </p>
              <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
                The new drop is unlocked
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
                Browse the latest cars before the best pieces disappear.
              </p>
            </div>

            <Link
              href="/cars"
              prefetch
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 px-7 text-base font-black uppercase tracking-[0.18em] text-black shadow-[0_0_35px_rgba(34,211,238,.28)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(34,211,238,.45)]"
            >
              Shop Sale Cars
            </Link>
          </div>
        </motion.div>
      </section>
    )
  }

  if (!timeLeft) {
    return null
  }

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 pt-5 pb-8">
      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 p-6 md:p-8 shadow-[0_0_45px_rgba(236,72,153,.18)]"
        animate={{
          boxShadow: [
            "0 0 30px rgba(236,72,153,.18)",
            "0 0 60px rgba(34,211,238,.24)",
            "0 0 30px rgba(236,72,153,.18)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-400/20 blur-[70px]" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-pink-500/20 blur-[80px]" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
              Sale Drop Incoming
            </p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">
              New cars unlock when the timer ends
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
              Sale products are hidden for now and will automatically appear across the site at launch.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {units.map(([label, value]) => (
              <motion.div
                key={label}
                className="min-w-[70px] rounded-2xl border border-white/10 bg-black/45 px-3 py-4 text-center shadow-inner backdrop-blur"
                animate={{
                  y:
                    label === "Seconds"
                      ? [0, -4, 0]
                      : 0,
                }}
                transition={{
                  duration: 1,
                  repeat:
                    label === "Seconds"
                      ? Infinity
                      : 0,
                }}
              >
                <p className="text-2xl font-black text-white md:text-4xl">
                  {pad(Number(value))}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-pink-300">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
