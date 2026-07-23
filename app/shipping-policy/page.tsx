export default function ShippingPolicyPage() {

  return (

    <main className="min-h-screen bg-black text-white px-6 py-16">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-5xl font-bold mb-6">
          Shipping & Dispatch Policy
        </h1>

        <div className="space-y-5 text-zinc-300 leading-relaxed text-lg">
          <p>
            Orders are typically dispatched within 1–3 business days after payment confirmation and product availability verification.
          </p>
          <p>
            Shipping charges are calculated at checkout based on the delivery method, cart composition, and destination.
          </p>
          <p>
            Tracking details are shared once the shipment has been handed over to the courier partner.
          </p>
          <p>
            Delivery timelines vary by location, courier performance, and external conditions beyond our control.
          </p>
          <p>
            We are not responsible for delays, rerouting, or service interruptions caused by courier partners or unforeseen events.
          </p>
        </div>

      </div>

    </main>

  )

}
