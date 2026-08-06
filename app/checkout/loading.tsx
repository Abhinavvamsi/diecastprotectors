import LightweightLoading from "@/components/lightweight-loading"

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#09090B] text-white">
      <LightweightLoading
        label="Checkout"
        message="Preparing secure checkout"
      />
    </main>
  )
}
