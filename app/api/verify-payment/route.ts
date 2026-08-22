import { auth } from "@clerk/nextjs/server"
import { createHmac, timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body: any

    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid payment verification payload" },
        { status: 400 }
      )
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      reservationId,
    } = body

    if (
      !reservationId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Payment verification details are required" },
        { status: 400 }
      )
    }

    const expectedSignature = createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!
    )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex")

    const isValid =
      expectedSignature.length ===
        razorpay_signature.length &&
      timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      )

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      verified: true,
      userId,
      reservationId,
    })
  } catch (error) {
    console.error("Verify Payment Error:", error)

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
