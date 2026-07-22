import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const mode = url.searchParams.get("hub.mode")
  const verifyToken = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  if (
    mode === "subscribe" &&
    verifyToken &&
    verifyToken === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    return new Response(challenge ?? "", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }

  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  )
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()

    console.log(
      "WhatsApp webhook event:",
      JSON.stringify(payload)
    )

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Webhook POST error:", error)

    return NextResponse.json(
      { success: false },
      { status: 200 }
    )
  }
}
