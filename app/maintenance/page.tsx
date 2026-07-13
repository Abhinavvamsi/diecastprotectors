export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-3xl">
          🛠️
        </div>
        <p className="uppercase tracking-[0.35em] text-xs text-pink-400">
          Temporary Maintenance
        </p>
        <h1 className="mt-4 text-4xl font-bold">We’ll be back soon</h1>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          The store is currently under maintenance. Customers can’t browse or place orders right now, but owner and admin access remains available.
        </p>
      </div>
    </main>
  )
}
