type LightweightLoadingProps = {
  label?: string
  message?: string
  compact?: boolean
}

export default function LightweightLoading({
  label = "Shinsei Diecast",
  message = "Preparing your dashboard",
  compact = false,
}: LightweightLoadingProps) {
  return (
    <div
      className={`
        flex
        min-h-[55vh]
        items-center
        justify-center
        bg-[#09090B]
        px-6
        text-white
        ${compact ? "py-10" : "py-20"}
      `}
    >
      <div className="w-full max-w-sm rounded-[2rem] border border-pink-500/20 bg-[#111118]/80 p-7 text-center shadow-[0_0_45px_rgba(236,72,153,.12)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/25 bg-pink-500/10 shadow-[0_0_28px_rgba(236,72,153,.18)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-400 border-t-transparent" />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-pink-300">
          {label}
        </p>

        <h2 className="mt-3 text-3xl font-bold">
          Loading
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          {message}
        </p>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full w-1/2 animate-[loader_1.35s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500" />
        </div>
      </div>
    </div>
  )
}
