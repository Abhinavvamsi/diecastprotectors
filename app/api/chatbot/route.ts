import { NextResponse } from "next/server"

import { getChatbotReply } from "@/lib/chatbot"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message = String(body?.message || "").trim()

    if (!message) {
      return NextResponse.json(
        {
          error: "Message is required",
        },
        {
          status: 400,
        }
      )
    }

    const reply = await getChatbotReply(message)

    return NextResponse.json(reply, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Chatbot Error:", error)

    return NextResponse.json(
      {
        answer:
          "I hit a small issue while checking that. Please try again, or use WhatsApp support if it’s urgent.",
        suggestions: [
          "Shipping charges",
          "How pre-orders work",
          "Track my order",
        ],
        actions: [
          {
            label: "Join WhatsApp Community",
            href: "https://chat.whatsapp.com/LXeocqm0ctA0ohmQSNfP0t?s=cl&p=a&ilr=1&amv=2",
          },
        ],
      },
      {
        status: 200,
      }
    )
  }
}
