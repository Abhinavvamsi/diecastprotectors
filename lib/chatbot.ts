import { prisma } from "@/lib/prisma"
import {
  BASE_SHIPPING,
  BASE_SHIPPING_ITEMS,
  EXTRA_ITEM_SHIPPING,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/shipping"
import {
  formatIndianDisplayDate,
  getProductPayablePrice,
  getProductRemainingPrice,
  getOrderItemPricing,
  isPreOrderDeadlineActive,
} from "@/lib/preorder"
import { getPreOrderShippingBatch } from "@/lib/preorder-shipping"

type ChatbotAction = {
  label: string
  href: string
}

export type ChatbotReply = {
  answer: string
  suggestions: string[]
  actions?: ChatbotAction[]
}

const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/LXeocqm0ctA0ohmQSNfP0t?s=cl&p=a&ilr=1&amv=2"

function normalizeQuery(message: string) {
  return message
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractOrderId(message: string) {
  const match = message.match(/\bHWS[-\s]?\d+\b/i)
  return match
    ? match[0].replace(/\s+/g, "-").replace(/^HWS(?!-)/i, "HWS-").toUpperCase()
    : null
}

function formatMoney(value: number) {
  return `₹${Math.max(0, Math.round(Number(value || 0)))}`
}

function formatOrderItems(items: any[]) {
  return items
    .slice(0, 5)
    .map((item) => {
      const quantity = Math.max(1, Number(item?.quantity || 1))
      const label = item?.isPreOrder ? " (pre-order)" : ""
      return `${item?.name || item?.id || "Item"} x${quantity}${label}`
    })
    .join("\n")
}

async function getOrderStatusReply(
  orderId: string
): Promise<ChatbotReply> {
  const order = await prisma.order.findFirst({
    where: {
      orderId: {
        equals: orderId,
        mode: "insensitive",
      },
    },
  })

  if (!order) {
    return {
      answer: `I could not find order ${orderId}. Please check the Order ID and try again.`,
      suggestions: [
        "Track my order",
        "Order history",
        "Contact support",
      ],
      actions: [
        {
          label: "Track Order",
          href: `/track-order?orderId=${encodeURIComponent(orderId)}`,
        },
        {
          label: "My Orders",
          href: "/orders",
        },
      ],
    }
  }

  const items = Array.isArray(order.products)
    ? (order.products as any[])
    : []
  const preOrderItems = items.filter(
    (item) => getOrderItemPricing(item).isPreOrder
  )
  const readyStockItems = items.filter(
    (item) => !getOrderItemPricing(item).isPreOrder
  )

  const balanceDue = preOrderItems.reduce((total, item) => {
    const pricing = getOrderItemPricing(item)

    if (
      !item.preOrderArrived ||
      item.preOrderBalancePaid
    ) {
      return total
    }

    return total + pricing.lineRemainingPrice
  }, 0)

  const waitingForArrivalCount = preOrderItems.filter(
    (item) =>
      !item.preOrderArrived &&
      !item.preOrderBalancePaid
  ).length

  const shippingBatch = getPreOrderShippingBatch(
    items,
    order.deliveryMethod
  )

  const preOrderLine = preOrderItems.length
    ? `\n\nPre-order update:\n${preOrderItems.length} pre-order item${preOrderItems.length === 1 ? "" : "s"} in this order.${waitingForArrivalCount ? ` ${waitingForArrivalCount} still awaiting arrival.` : ""}${balanceDue > 0 ? ` Balance due now: ${formatMoney(balanceDue)}.` : ""}${shippingBatch.shippingAmount > 0 ? ` Shipping due now: ${formatMoney(shippingBatch.shippingAmount)}.` : ""}`
    : ""

  const readyStockLine = readyStockItems.length
    ? `\n\nReady-stock items:\n${formatOrderItems(readyStockItems)}`
    : ""

  return {
    answer: `Order ${order.orderId} is currently ${order.status}.\n\nTotal paid: ${formatMoney(order.totalAmount)}.${readyStockLine}${preOrderItems.length ? `\n\nPre-order items:\n${formatOrderItems(preOrderItems)}` : ""}${preOrderLine}`,
    suggestions: [
      "Track another order",
      "Payment due orders",
      "Shipping charges",
    ],
    actions: [
      {
        label: "Track Order",
        href: `/track-order?orderId=${encodeURIComponent(order.orderId)}`,
      },
      {
        label: preOrderItems.length
          ? "Open Payment Due"
          : "Order History",
        href: preOrderItems.length
          ? "/orders?filter=payment-due"
          : "/orders",
      },
    ],
  }
}

function buildFallbackReply(): ChatbotReply {
  return {
    answer:
      "I can help with shipping charges, pre-orders, available stock, pickup, order tracking, remaining balance payments, and store policies. Try asking about a car model, a brand, or a store process.",
    suggestions: [
      "Shipping charges",
      "Pre-order help",
      "Available Mini GT cars",
      "Track my order",
    ],
    actions: [
      {
        label: "Browse Inventory",
        href: "/cars",
      },
      {
        label: "Open Pre-Orders",
        href: "/pre-orders",
      },
    ],
  }
}

async function searchProducts(message: string) {
  const query = normalizeQuery(message)
  if (!query) return []

  const stopWords = new Set([
    "do",
    "you",
    "have",
    "any",
    "show",
    "me",
    "is",
    "are",
    "the",
    "a",
    "an",
    "in",
    "stock",
    "available",
    "preorder",
    "pre",
    "order",
    "brand",
    "cars",
    "car",
    "items",
    "item",
    "for",
    "with",
    "of",
    "from",
  ])

  const terms = query
    .split(" ")
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !stopWords.has(term))

  if (!terms.length) return []

  const primaryTerm = terms.join(" ")

  return prisma.product.findMany({
    where: {
      OR: [
        {
          name: {
            contains: primaryTerm,
            mode: "insensitive",
          },
        },
        {
          brand: {
            name: {
              contains: primaryTerm,
              mode: "insensitive",
            },
          },
        },
        ...terms.flatMap((term) => [
          {
            name: {
              contains: term,
              mode: "insensitive" as const,
            },
          },
          {
            brand: {
              name: {
                contains: term,
                mode: "insensitive" as const,
              },
            },
          },
        ]),
      ],
    },
    include: {
      brand: true,
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  })
}

function formatProductResult(product: any) {
  const availableStock = Math.max(
    0,
    Number(product.stock || 0) - Number(product.reservedStock || 0)
  )

  if (product.isPreOrder) {
    const deposit = getProductPayablePrice(product)
    const remaining = getProductRemainingPrice(product)
    const deadline = product.preOrderDeadline
      ? formatIndianDisplayDate(product.preOrderDeadline)
      : "Open now"
    const isOpen = isPreOrderDeadlineActive(product)

    return `${product.name}${product.brand?.name ? ` (${product.brand.name})` : ""} — Pre-order ${isOpen ? "open" : "closed"}, deposit ₹${deposit}, remaining ₹${remaining}, available ${availableStock}, closes ${deadline}.`
  }

  return `${product.name}${product.brand?.name ? ` (${product.brand.name})` : ""} — Ready stock available: ${availableStock}, price ₹${product.price}.`
}

export async function getChatbotReply(
  message: string
): Promise<ChatbotReply> {
  const text = normalizeQuery(message)

  if (!text) {
    return {
      answer:
        "Ask me about stock, shipping, pre-orders, tracking, pickup, or store policies and I’ll point you in the right direction.",
      suggestions: [
        "Shipping charges",
        "How pre-orders work",
        "Track my order",
        "Available stock",
      ],
    }
  }

  const orderId = extractOrderId(message)

  if (orderId) {
    return getOrderStatusReply(orderId)
  }

  const settings = await prisma.storeSettings.findFirst({
    orderBy: {
      id: "asc",
    },
  })

  const isShippingQuestion =
    text.includes("shipping") ||
    text.includes("delivery charge") ||
    text.includes("courier")

  if (isShippingQuestion) {
    const pickupLine = settings?.pickupEnabled
      ? `Pickup is also available from ${settings.pickupLocation || "your configured pickup location"}, and pickup orders have no shipping charge.`
      : "Pickup is currently not enabled."

    return {
      answer: `Ready-stock shipping is ₹${BASE_SHIPPING} for up to ${BASE_SHIPPING_ITEMS} items. After that, ₹${EXTRA_ITEM_SHIPPING} is added per extra ready-stock item. Ready-stock orders unlock free shipping at ₹${FREE_SHIPPING_THRESHOLD}. Pre-order-only checkout does not charge shipping upfront; pre-order shipping is collected later when dispatch is ready. ${pickupLine}`,
      suggestions: [
        "How pre-orders work",
        "Pickup details",
        "Browse inventory",
      ],
      actions: [
        {
          label: "Browse Inventory",
          href: "/cars",
        },
        {
          label: "Order History",
          href: "/orders",
        },
      ],
    }
  }

  const isPreOrderQuestion =
    text.includes("pre order") ||
    text.includes("pre-order") ||
    text.includes("preorder") ||
    text.includes("remaining balance") ||
    text.includes("balance payment") ||
    text.includes("item arrived")

  if (isPreOrderQuestion) {
    return {
      answer:
        "Pre-orders collect only the deposit amount during checkout. The remaining balance is collected later after the specific pre-order item is marked as arrived by admin. If an order contains multiple pre-order items with different arrival times, each balance payment unlocks separately when that item arrives. Pre-order shipping is also collected later at dispatch time.",
      suggestions: [
        "Open pre-orders",
        "How to pay remaining balance",
        "Shipping charges",
      ],
      actions: [
        {
          label: "View Pre-Orders",
          href: "/pre-orders",
        },
        {
          label: "My Orders",
          href: "/orders?filter=payment-due",
        },
      ],
    }
  }

  if (
    text.includes("track order") ||
    text.includes("order tracking") ||
    text.includes("where is my order") ||
    text.includes("track my order")
  ) {
    return {
      answer:
        "You can track any order using your Order ID. If you are signed in, your full order history is also available in My Orders.",
      suggestions: [
        "Open track order page",
        "My orders",
        "Shipping charges",
      ],
      actions: [
        {
          label: "Track Order",
          href: "/track-order",
        },
        {
          label: "My Orders",
          href: "/orders",
        },
      ],
    }
  }

  if (
    text.includes("pickup") ||
    text.includes("pick up") ||
    text.includes("pickup location")
  ) {
    return {
      answer: settings?.pickupEnabled
        ? `Pickup is available from ${settings.pickupLocation || "your configured pickup location"}. Pickup orders do not include shipping charges.`
        : "Pickup is currently not enabled. Orders are handled through shipping only right now.",
      suggestions: [
        "Shipping charges",
        "Browse inventory",
        "Track my order",
      ],
      actions: [
        {
          label: "Browse Inventory",
          href: "/cars",
        },
      ],
    }
  }

  if (
    text.includes("payment") ||
    text.includes("razorpay") ||
    text.includes("upi") ||
    text.includes("card")
  ) {
    return {
      answer:
        "Payments on the site are processed securely through Razorpay. That supports common methods like UPI, cards, net banking, and wallet options offered by Razorpay at checkout.",
      suggestions: [
        "Shipping charges",
        "How pre-orders work",
        "Browse inventory",
      ],
    }
  }

  if (
    text.includes("refund") ||
    text.includes("return policy") ||
    text.includes("returns")
  ) {
    return {
      answer:
        "Return and refund details are available in the site policy page. If you want, I can take you there directly.",
      suggestions: [
        "Open refund policy",
        "Shipping policy",
        "Terms and conditions",
      ],
      actions: [
        {
          label: "Refund Policy",
          href: "/refund-policy",
        },
      ],
    }
  }

  if (
    text.includes("privacy") ||
    text.includes("terms") ||
    text.includes("policy") ||
    text.includes("policies")
  ) {
    return {
      answer:
        "You can open the policy pages directly from here depending on what you need.",
      suggestions: [
        "Privacy policy",
        "Terms and conditions",
        "Shipping policy",
      ],
      actions: [
        {
          label: "Privacy Policy",
          href: "/privacy-policy",
        },
        {
          label: "Terms",
          href: "/terms-and-conditions",
        },
        {
          label: "Shipping Policy",
          href: "/shipping-policy",
        },
      ],
    }
  }

  if (
    text.includes("whatsapp") ||
    text.includes("community") ||
    text.includes("group")
  ) {
    return {
      answer:
        "You can join the Shinsei Diecast WhatsApp community for updates, upcoming releases, and collector alerts.",
      suggestions: [
        "Join WhatsApp community",
        "Open pre-orders",
        "Browse inventory",
      ],
      actions: [
        {
          label: "Join WhatsApp Community",
          href: WHATSAPP_GROUP_URL,
        },
      ],
    }
  }

  if (
    text.includes("available") ||
    text.includes("stock") ||
    text.includes("brand") ||
    text.includes("mini gt") ||
    text.includes("hot wheels") ||
    text.includes("pop race") ||
    text.includes("inno64") ||
    text.includes("inno 64") ||
    text.includes("product") ||
    text.includes("car")
  ) {
    const products = await searchProducts(text)

    if (products.length) {
      const containsPreOrder = products.some(
        (product) => product.isPreOrder
      )

      return {
        answer: `Here’s what I found:\n\n${products
          .map(formatProductResult)
          .join("\n")}`,
        suggestions: containsPreOrder
          ? [
              "Open pre-orders",
              "Browse inventory",
              "How pre-orders work",
            ]
          : [
              "Browse inventory",
              "Shipping charges",
              "Track my order",
            ],
        actions: [
          {
            label: containsPreOrder
              ? "Open Pre-Orders"
              : "Browse Inventory",
            href: containsPreOrder ? "/pre-orders" : "/cars",
          },
        ],
      }
    }
  }

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {
    return {
      answer:
        "Hi. I’m your Shinsei Diecast store assistant. Ask me about stock, pre-orders, shipping charges, order tracking, remaining balance payments, or policies.",
      suggestions: [
        "Available stock",
        "How pre-orders work",
        "Shipping charges",
        "Track my order",
      ],
    }
  }

  return buildFallbackReply()
}
