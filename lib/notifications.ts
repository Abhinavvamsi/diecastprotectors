type ApprovedWhatsAppTemplateName =
  | "order_confirmation"
  | "order_shipped"
  | "preorder_deposit_confirmation"
  | "preorder_ready_for_payment"
  | "order_cancelled"

type WhatsAppOrder = {
  orderId: string
  customer: string
  phone: string
  status?: string
  totalAmount?: number
  items?: string
  templateName?: ApprovedWhatsAppTemplateName
  hasOnlyPreOrderItems?: boolean
  trackingLink?: string
  depositPaid?: number
  originalPrice?: number
  remainingBalance?: number
  expectedArrival?: string
  reason?: string
  refundWindow?: string
}

const defaultWhatsAppTemplateNames: Record<
  ApprovedWhatsAppTemplateName,
  string
> = {
  order_confirmation: "order_confirmation",
  order_shipped: "order_shipped",
  preorder_deposit_confirmation:
    "preorder_deposit_confirmation",
  preorder_ready_for_payment:
    "preorder_ready_for_payment",
  order_cancelled: "order_cancelled",
}

function buildFallbackText(order: WhatsAppOrder) {
  const lines = [
    `Shinsei Diecast`,
    `Order ${order.orderId}`,
    `Hi ${order.customer},`,
  ]

  if (order.status) {
    lines.push(`Your order status is now: ${order.status}`)
  }

  if (typeof order.totalAmount === "number") {
    lines.push(`Total: ₹${order.totalAmount}`)
  }

  lines.push("Track your order on our website.")

  return lines.join("\n")
}

function normalizePhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "")

  if (digits.length === 10) {
    return `91${digits}`
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`
  }

  return digits
}

function formatAmount(value?: number) {
  return String(Math.max(0, Math.round(Number(value || 0))))
}

type WhatsAppItemsSummaryOptions = {
  mixedOrderBreakdown?: boolean
  includePreOrderLabel?: boolean
}

function formatWhatsAppItemLine(
  item: any,
  options?: WhatsAppItemsSummaryOptions
) {
  const quantity = Math.max(
    1,
    Number(item.quantity || 1)
  )
  const preOrderLabel =
    options?.includePreOrderLabel && item.isPreOrder
      ? " (Pre-order)"
      : ""

  return `${item.name}${preOrderLabel} x${quantity}`
}

export function buildWhatsAppItemsSummary(
  products: any[] = [],
  options?: WhatsAppItemsSummaryOptions
) {
  const validItems = products.filter(
    (item) => item && item.name
  )

  if (!validItems.length) {
    return "Items not available"
  }

  if (!options?.mixedOrderBreakdown) {
    return validItems
      .map((item) => formatWhatsAppItemLine(item, options))
      .join(", ")
  }

  const readyStockItems = validItems.filter(
    (item) => !Boolean(item.isPreOrder)
  )
  const preOrderItems = validItems.filter((item) =>
    Boolean(item.isPreOrder)
  )

  const sections: string[] = []

  if (readyStockItems.length) {
    sections.push(
      `Ready to dispatch now: ${readyStockItems
        .map((item) => formatWhatsAppItemLine(item, options))
        .join(", ")}`
    )
  }

  if (preOrderItems.length) {
    sections.push(
      `Pre-order deposit items: ${preOrderItems
        .map((item) =>
          formatWhatsAppItemLine(item, {
            ...options,
            includePreOrderLabel: true,
          })
        )
        .join(", ")}`
    )
    sections.push(
      "Pre-order balance will be requested when each item arrives."
    )
  }

  return sections.join("\n")
}

function buildTrackingLink(orderId: string, trackingLink?: string) {
  if (trackingLink) return trackingLink

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.shinseidiecast.com"

  return `${siteUrl.replace(/\/$/, "")}/track-order?orderId=${encodeURIComponent(
    orderId
  )}`
}

function buildOrdersPaymentDueLink() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.shinseidiecast.com"

  return `${siteUrl.replace(
    /\/$/,
    ""
  )}/orders?filter=payment-due`
}

function enhanceWhatsAppError(details: string) {
  if (
    details.includes("Unsupported post request") ||
    details.includes("\"code\":100") ||
    details.includes("\"error_subcode\":33")
  ) {
    return `${details}\nHint: check that WHATSAPP_PHONE_NUMBER_ID is the actual Phone Number ID from Meta WhatsApp Manager, not the WhatsApp Business Account ID, and that the number is connected to the same app.`
  }

  if (
    details.includes("132001") ||
    details.toLowerCase().includes("translation") ||
    details.toLowerCase().includes("template name does not exist")
  ) {
    return `${details}\nHint: the template name/language must exactly match an approved template in the same WhatsApp Business Account as WHATSAPP_PHONE_NUMBER_ID. Set WHATSAPP_TEMPLATE_ORDER_CONFIRMATION and WHATSAPP_TEMPLATE_LANGUAGE_CODE to the exact values shown in WhatsApp Manager.`
  }

  return details
}

function getTemplateLanguageCandidates() {
  const configuredLanguage =
    process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE?.trim()

  if (configuredLanguage) {
    return [configuredLanguage]
  }

  const candidates = ["en", "en_US"]

  return Array.from(new Set(candidates))
}

function getMetaTemplateName(
  templateName: ApprovedWhatsAppTemplateName
) {
  const templateNames: Record<
    ApprovedWhatsAppTemplateName,
    string | undefined
  > = {
    order_confirmation:
      process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMATION ||
      process.env.WHATSAPP_TEMPLATE_NAME,
    order_shipped:
      process.env.WHATSAPP_TEMPLATE_ORDER_SHIPPED,
    preorder_deposit_confirmation:
      process.env
        .WHATSAPP_TEMPLATE_PREORDER_DEPOSIT_CONFIRMATION ||
      process.env.WHATSAPP_TEMPLATE_PREORDER_DEPOSIT,
    preorder_ready_for_payment:
      process.env
        .WHATSAPP_TEMPLATE_PREORDER_READY_FOR_PAYMENT ||
      process.env.WHATSAPP_TEMPLATE_PREORDER_READY,
    order_cancelled:
      process.env.WHATSAPP_TEMPLATE_ORDER_CANCELLED,
  }

  return (
    templateNames[templateName]?.trim() ||
    defaultWhatsAppTemplateNames[templateName]
  )
}

function shouldRetryTemplateLanguage(details: string) {
  return (
    details.includes("132001") ||
    details.toLowerCase().includes("translation") ||
    details.toLowerCase().includes("template name does not exist")
  )
}

function shouldRetryTemplateParameters(details: string) {
  return (
    details.includes("132000") ||
    details
      .toLowerCase()
      .includes("number of parameters does not match") ||
    details.toLowerCase().includes("localizable_params")
  )
}

function resolveTemplateName(
  order: WhatsAppOrder
): ApprovedWhatsAppTemplateName | null {
  if (order.templateName) {
    return order.templateName
  }

  const status = (order.status || "").trim().toLowerCase()

  if (!status) {
    return null
  }

  if (status.includes("ship")) {
    return "order_shipped"
  }

  if (
    status.includes("cancel")
  ) {
    return "order_cancelled"
  }

  if (
    status.includes("ready") &&
    status.includes("payment")
  ) {
    return "preorder_ready_for_payment"
  }

  if (status.includes("confirm")) {
    return order.hasOnlyPreOrderItems
      ? "preorder_deposit_confirmation"
      : "order_confirmation"
  }

  return null
}

function buildTemplateParameters(
  templateName: ApprovedWhatsAppTemplateName,
  order: WhatsAppOrder
) {
  switch (templateName) {
    case "order_confirmation":
      return [
        { type: "text", text: order.customer },
        { type: "text", text: order.orderId },
        {
          type: "text",
          text: order.items || "Items not available",
        },
        {
          type: "text",
          text: formatAmount(order.totalAmount),
        },
        {
          type: "text",
          text: buildTrackingLink(
            order.orderId,
            order.trackingLink
          ),
        },
      ]

    case "order_shipped":
      return [
        { type: "text", text: order.customer },
        { type: "text", text: order.orderId },
        {
          type: "text",
          text: order.items || "Items not available",
        },
        {
          type: "text",
          text: buildTrackingLink(
            order.orderId,
            order.trackingLink
          ),
        },
      ]

    case "preorder_deposit_confirmation":
      return [
        { type: "text", text: order.customer },
        { type: "text", text: order.orderId },
        {
          type: "text",
          text: order.items || "Items not available",
        },
        {
          type: "text",
          text: formatAmount(order.depositPaid),
        },
        {
          type: "text",
          text: formatAmount(order.originalPrice),
        },
        {
          type: "text",
          text: formatAmount(order.remainingBalance),
        },
        {
          type: "text",
          text: order.expectedArrival || "To be announced",
        },
      ]

    case "preorder_ready_for_payment":
      return [
        { type: "text", text: order.customer },
        { type: "text", text: order.orderId },
        {
          type: "text",
          text: order.items || "Items not available",
        },
        {
          type: "text",
          text: formatAmount(order.remainingBalance),
        },
        {
          type: "text",
          text: buildOrdersPaymentDueLink(),
        },
      ]

    case "order_cancelled":
      return [
        { type: "text", text: order.customer },
        { type: "text", text: order.orderId },
        {
          type: "text",
          text: order.items || "Items not available",
        },
        {
          type: "text",
          text:
            order.reason ||
            "Order cancelled by our team",
        },
        {
          type: "text",
          text:
            order.refundWindow ||
            "5-7 business days",
        },
      ]
  }
}

function buildTemplateParameterVariants(
  templateName: ApprovedWhatsAppTemplateName,
  order: WhatsAppOrder
) {
  const primaryParameters = buildTemplateParameters(
    templateName,
    order
  )

  if (!primaryParameters) {
    return []
  }

  if (templateName !== "order_confirmation") {
    return [
      {
        label: "primary",
        parameters: primaryParameters,
      },
    ]
  }

  return [
    {
      label: "with_tracking_link",
      parameters: primaryParameters,
    },
    {
      label: "without_tracking_link",
      parameters: primaryParameters.slice(0, 4),
    },
  ]
}

export async function sendWhatsAppOrderMessage(
  order: WhatsAppOrder
) {
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID
  const recipientPhone = normalizePhoneNumber(
    process.env.WHATSAPP_NOTIFY_TO || order.phone
  )

  if (
    !accessToken ||
    !phoneNumberId ||
    !recipientPhone
  ) {
    return { skipped: true }
  }

  const templateName = resolveTemplateName(order)

  if (!templateName) {
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
          type: "text",
          text: {
            preview_url: false,
            body: buildFallbackText(order),
          },
        }),
      }
    )

    if (!response.ok) {
      const details = enhanceWhatsAppError(
        await response.text()
      )
      throw new Error(
        `WhatsApp send failed: ${response.status} ${details}`
      )
    }

    return { skipped: false, template: "text" }
  }

  const parameterVariants = buildTemplateParameterVariants(
    templateName,
    order
  )
  const metaTemplateName =
    getMetaTemplateName(templateName)

  if (!parameterVariants.length) {
    return { skipped: true }
  }

  const templateLanguageCandidates =
    getTemplateLanguageCandidates()

  let lastError: Error | null = null

  for (const languageCode of templateLanguageCandidates) {
    for (const variant of parameterVariants) {
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
            type: "template",
            template: {
              name: metaTemplateName,
              language: {
                code: languageCode,
              },
              components: [
                {
                  type: "body",
                  parameters: variant.parameters,
                },
              ],
            },
          }),
        }
      )

      if (response.ok) {
        return {
          skipped: false,
          template: metaTemplateName,
          language: languageCode,
          variant: variant.label,
        }
      }

      const details = enhanceWhatsAppError(
        await response.text()
      )
      lastError = new Error(
        `WhatsApp send failed for template "${metaTemplateName}" using language "${languageCode}" and parameter variant "${variant.label}": ${response.status} ${details}`
      )

      if (shouldRetryTemplateParameters(details)) {
        continue
      }

      if (shouldRetryTemplateLanguage(details)) {
        break
      }

      throw lastError
    }
  }

  if (lastError) {
    throw new Error(
      `WhatsApp template "${metaTemplateName}" failed. Tried language code(s): ${templateLanguageCandidates.join(
        ", "
      )}. ${lastError.message}`
    )
  }

  return { skipped: true }
}
