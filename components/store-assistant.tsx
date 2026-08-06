"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react"
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { useCartStore } from "@/store/cart-store"

type ChatAction = {
  label: string
  href?: string
  type?: "link" | "add_to_cart" | "buy_now"
  product?: {
    id: string
    name: string
    brandName?: string
    price: number
    originalPrice: number
    remainingPrice?: number
    image: string
    stock: number
    isPreOrder?: boolean
    depositAmount?: number
    expectedArrival?: string
    preOrderDeadline?: string
  }
}

type ChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
  suggestions?: string[]
  actions?: ChatAction[]
}

const STORAGE_KEY = "shinsei-store-assistant"

const starterSuggestions = [
  "Shipping charges",
  "How pre-orders work",
  "Track my order",
  "Available stock",
]

const initialMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi. I’m your Shinsei Diecast assistant. Ask me about stock, shipping, pre-orders, pickup, tracking, or store policies.",
  suggestions: starterSuggestions,
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

function isExternalLink(href?: string) {
  if (!href) return false

  return /^https?:\/\//i.test(href)
}

function getMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getProductActions(actions?: ChatAction[]) {
  const products = new Map<
    string,
    {
      product: NonNullable<ChatAction["product"]>
      addAction?: ChatAction
      buyAction?: ChatAction
    }
  >()

  actions
    ?.filter((action) => action.product)
    .forEach((action) => {
      const product = action.product!
      const current =
        products.get(product.id) || {
          product,
        }

      if (action.type === "add_to_cart") {
        current.addAction = action
      }

      if (action.type === "buy_now") {
        current.buyAction = action
      }

      products.set(product.id, current)
    })

  return Array.from(products.values())
}

function getLinkActions(actions?: ChatAction[]) {
  return actions?.filter(
    (action) =>
      action.type !== "add_to_cart" &&
      action.type !== "buy_now"
  )
}

export default function StoreAssistant() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const addToCart = useCartStore(
    (state) => state.addToCart
  )
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    initialMessage,
  ])
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const hidden =
    pathname?.startsWith("/admin") ||
    pathname === "/checkout" ||
    pathname === "/processing" ||
    pathname === "/success" ||
    pathname === "/maintenance" ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up")

  useEffect(() => {
    if (hidden) return

    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as {
        open?: boolean
        messages?: ChatMessage[]
      }

      if (Array.isArray(parsed.messages) && parsed.messages.length) {
        setMessages(parsed.messages)
      }

      if (typeof parsed.open === "boolean") {
        setOpen(parsed.open)
      }
    } catch (error) {
      console.error(error)
    }
  }, [hidden])

  useEffect(() => {
    if (hidden) return

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        open,
        messages,
      })
    )
  }, [hidden, messages, open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    })
  }, [messages, open, loading])

  async function submitMessage(
    rawMessage: string
  ) {
    const message = rawMessage.trim()
    if (!message || loading) return

    const userMessage: ChatMessage = {
      id: getMessageId(),
      role: "user",
      text: message,
    }

    setMessages((current) => [
      ...current,
      userMessage,
    ])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      })

      const data = await response.json()

      setMessages((current) => [
        ...current,
        {
          id: getMessageId(),
          role: "assistant",
          text:
            String(data?.answer || "").trim() ||
            "I could not find a solid answer for that right now.",
          suggestions: Array.isArray(data?.suggestions)
            ? data.suggestions
            : starterSuggestions,
          actions: Array.isArray(data?.actions)
            ? data.actions
            : undefined,
        },
      ])
    } catch (error) {
      console.error(error)

      setMessages((current) => [
        ...current,
        {
          id: getMessageId(),
          role: "assistant",
          text:
            "I hit a small issue while checking that. Please try again in a moment.",
          suggestions: starterSuggestions,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submitMessage(input)
  }

  function closeAssistant() {
    setOpen(false)
    setLoading(false)
  }

  function handleProductAction(action: ChatAction) {
    const product = action.product
    if (!product) return

    if (!user) {
      toast.error("Please login first")
      router.push("/sign-in")
      return
    }

    if (Number(product.stock || 0) <= 0) {
      toast.error("This item is currently unavailable")
      return
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      stock: product.stock,
      isPreOrder: product.isPreOrder,
      depositAmount: product.depositAmount,
      expectedArrival: product.expectedArrival,
      preOrderDeadline: product.preOrderDeadline,
    })

    if (action.type === "buy_now") {
      toast.success("Redirecting to checkout 🚀")
      setOpen(false)
      router.push("/checkout")
      return
    }

    toast.success(`${product.name} added to cart 🛒`)
  }

  if (hidden) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+14px)] left-3 right-3 z-[1000] sm:bottom-[calc(env(safe-area-inset-bottom,0px)+20px)] sm:left-auto sm:right-6">
      {open ? (
        <div className="pointer-events-auto relative ml-auto max-h-[min(82svh,720px)] w-full overflow-hidden rounded-[24px] border border-pink-400/25 bg-[#0D0D14]/95 shadow-[0_20px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:w-[min(92vw,380px)] sm:rounded-[28px]">
          <button
            type="button"
            onMouseDownCapture={closeAssistant}
            onTouchStartCapture={closeAssistant}
            onClick={closeAssistant}
            className="absolute right-4 top-4 z-30 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-[#20202A] px-4 text-xs font-bold uppercase tracking-[0.16em] text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-pink-300/50 hover:bg-pink-500/15 hover:text-white"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>

          <div className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.28),transparent_46%),linear-gradient(135deg,#171120_0%,#0E0E14_100%)] px-5 py-4">
            <div className="pointer-events-none absolute -right-10 top-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
            <div className="relative z-10 flex items-start justify-between gap-3 pr-28">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-pink-300">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.24em]">
                    Store Assistant
                  </p>
                </div>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  Ask Shinsei
                </h3>
                <p className="mt-1 text-sm text-zinc-300">
                  Shipping, pre-orders, stock, tracking, and policies.
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[52svh] space-y-4 overflow-y-auto px-4 py-4 sm:max-h-[58vh]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-3xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_0_24px_rgba(236,72,153,0.3)]"
                      : "border border-cyan-400/18 bg-[#14141D] text-zinc-100 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                  }`}
                >
                  <div className="whitespace-pre-line break-words text-sm leading-6">
                    {message.text}
                  </div>

                  {getProductActions(message.actions).length ? (
                    <div className="mt-3 space-y-3">
                      {getProductActions(message.actions).map(
                        ({ product, addAction, buyAction }) => (
                          <div
                            key={product.id}
                            className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#0D0D14] shadow-[0_0_24px_rgba(34,211,238,.08)]"
                          >
                            <div className="flex gap-3 p-3">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-20 w-20 shrink-0 rounded-xl border border-white/10 bg-black object-contain"
                                />
                              ) : null}

                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-bold uppercase leading-5 text-white">
                                  {product.name}
                                </p>

                                {product.brandName ? (
                                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-pink-300">
                                    {product.brandName}
                                  </p>
                                ) : null}

                                <p className="mt-2 text-lg font-black text-pink-400">
                                  ₹{product.price}
                                </p>

                                {product.isPreOrder ? (
                                  <div className="mt-1 space-y-0.5 text-[12px] font-semibold leading-5 text-cyan-200">
                                    <p>Original: ₹{product.originalPrice}</p>
                                    <p>Deposit now: ₹{product.price}</p>
                                    <p>Remaining later: ₹{product.remainingPrice || 0}</p>
                                    {product.expectedArrival ? (
                                      <p>Arrives: {product.expectedArrival}</p>
                                    ) : null}
                                  </div>
                                ) : (
                                  <p className="mt-1 text-[12px] font-semibold text-green-400">
                                    Ready stock: {product.stock}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
                              {addAction ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProductAction(addAction)
                                  }
                                  className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-300/60 hover:bg-cyan-400/15"
                                >
                                  Add to Cart
                                </button>
                              ) : null}

                              {buyAction ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProductAction(buyAction)
                                  }
                                  className="rounded-xl border border-pink-400/40 bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_18px_rgba(236,72,153,.24)] transition hover:scale-[1.01]"
                                >
                                  Buy Now
                                </button>
                              ) : null}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : null}

                  {getLinkActions(message.actions)?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getLinkActions(message.actions)?.map((action, index) =>
                        isExternalLink(action.href) ? (
                          <a
                            key={`${message.id}-${action.label}-${index}`}
                            href={action.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.12em] text-white transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                          >
                            {action.label}
                          </a>
                        ) : (
                          <Link
                            key={`${message.id}-${action.label}-${index}`}
                            href={action.href || "/"}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.12em] text-white transition hover:border-cyan-300/40 hover:bg-cyan-400/10"
                          >
                            {action.label}
                          </Link>
                        )
                      )}
                    </div>
                  ) : null}

                  {message.role === "assistant" &&
                  message.suggestions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.slice(0, 4).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => submitMessage(suggestion)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-200 transition hover:border-pink-300/45 hover:bg-pink-500/10 hover:text-white"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-cyan-400/18 bg-[#14141D] px-4 py-3 text-sm text-zinc-300 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300" />
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300 [animation-delay:160ms]" />
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300 [animation-delay:320ms]" />
                    <span className="ml-2">Checking that for you…</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 bg-[#0E0E15] p-4"
          >
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <Bot className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  placeholder="Ask about shipping, pre-orders, stock..."
                  className="h-12 w-full rounded-2xl border border-pink-400/25 bg-[#171720] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-400 focus:border-pink-300 focus:shadow-[0_0_28px_rgba(236,72,153,0.2)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex h-12 min-w-[3.2rem] items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 px-4 text-white shadow-[0_0_24px_rgba(236,72,153,0.26)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto group relative ml-auto overflow-hidden rounded-full border border-pink-400/30 bg-[linear-gradient(135deg,#171120_0%,#101018_100%)] p-3 text-white shadow-[0_0_28px_rgba(236,72,153,0.22)] transition hover:scale-[1.02] sm:px-5 sm:py-4"
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.28),transparent_48%)] opacity-90" />
          <span className="relative flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[11px] uppercase tracking-[0.24em] text-pink-200/80">
                Need Help
              </span>
              <span className="block text-sm font-semibold">
                Ask Shinsei
              </span>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
