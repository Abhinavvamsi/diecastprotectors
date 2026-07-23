"use client"

import { motion } from "framer-motion"

export default function PreOrdersHeroAnimation() {
  return (
    <div className="relative mx-auto mt-10 h-44 w-full max-w-xl overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-[#11111A] via-[#171724] to-[#0B0B12] shadow-[0_0_60px_rgba(34,211,238,.12)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,.16),transparent_40%),radial-gradient(circle_at_bottom,rgba(34,211,238,.14),transparent_35%)]" />
      <div className="absolute inset-x-8 bottom-8 h-3 rounded-full bg-gradient-to-r from-fuchsia-500/20 via-cyan-400/20 to-purple-500/20 blur-md" />

      <motion.div
        className="absolute left-8 top-10 flex items-center gap-3"
        animate={{
          x: [0, 150, 0],
          y: [0, -8, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="flex h-20 w-28 items-center justify-center rounded-3xl border border-fuchsia-500/30 bg-white/5 text-5xl shadow-[0_0_35px_rgba(236,72,153,.22)] backdrop-blur">
          🏎️
        </div>
        <div className="hidden sm:flex flex-col gap-2">
          <span className="h-2 w-20 rounded-full bg-fuchsia-400/70 animate-pulse" />
          <span className="h-2 w-14 rounded-full bg-cyan-400/60 animate-pulse" />
          <span className="h-2 w-24 rounded-full bg-purple-400/50 animate-pulse" />
        </div>
      </motion.div>

      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs uppercase tracking-[0.35em] text-zinc-400">
        <span>Hot preorder drops</span>
        <span className="text-cyan-300">Deposit today • balance due on arrival</span>
      </div>
    </div>
  )
}
