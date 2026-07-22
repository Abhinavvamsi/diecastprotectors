type WhatsAppOrder = {
  orderId: string
  customer: string
  phone: string
  status: string
  totalAmount?: number
}

function buildStatusText(order: WhatsAppOrder) {
  const lines = [
    `Shinsei Diecast`,
    `Order ${order.orderId}`,
    `Hi ${order.customer},`,
    `Your order status is now: ${order.status}`,
  ]

  if (typeof order.totalAmount === "number") {
    lines.push(`Total: ₹${order.totalAmount}`)
  }

  lines.push("Track your order on our website.")

  return lines.join("\n")
}

export async function sendWhatsAppOrderMessage(
  order: WhatsAppOrder
) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID
  const recipientPhone =
    process.env.WHATSAPP_NOTIFY_TO || order.phone

  if (!accessToken || !phoneNumberId || !recipientPhone) {
    return { skipped: true }
  }

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME
  const templateLanguage =
    process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || "en_US"

  const bodyParameters = [
    { type: "text", text: order.customer },
    { type: "text", text: order.orderId },
    { type: "text", text: order.status },
    {
      type: "text",
      text:
        typeof order.totalAmount === "number"
          ? `₹${order.totalAmount}`
          : "₹0",
    },
  ]

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: templateName ? "template" : "text",
        ...(templateName
          ? {
              template: {
                name: templateName,
                language: {
                  code: templateLanguage,
                },
                components: [
                  {
                    type: "body",
                    parameters: bodyParameters,
                  },
                ],
              },
            }
          : {
              text: {
                preview_url: false,
                body: buildStatusText(order),
              },
            }),
      }),
    }
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(
      `WhatsApp send failed: ${response.status} ${details}`
    )
  }

  return { skipped: false }
}
