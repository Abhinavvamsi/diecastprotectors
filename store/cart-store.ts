import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"

type CartItem = {
  id: string
  name: string

  price: number

  originalPrice: number

  saleOriginalPrice?: number | null

  siteDiscountPercent?: number | null

  quantityPricing?: {
    quantity: string
    price: string
    saleOriginalPrice?: number | string | null
  }[]

  image: string
	  isPreOrder?: boolean
	  depositAmount?: number
	  expectedArrival?: string
	  preOrderDeadline?: string

	  quantity: number

  stock: number
}

type CartStore = {
  cart: CartItem[]

  syncProduct: (
    product: Partial<CartItem> & { id: string }
  ) => void

  syncStock: (
    id: string,
    stock: number
  ) => void

  addToCart: (
    item: Omit<CartItem, "quantity">
  ) => void

  increaseQuantity: (
    id: string
  ) => void

  decreaseQuantity: (
    id: string
  ) => void

  removeFromCart: (
    id: string
  ) => void

  clearCart: () => void
}

export const useCartStore =
  create<CartStore>()(
    persist(
      (set) => ({

        cart: [],

        syncProduct: (product) =>
          set((state) => ({
            cart: state.cart.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    ...product,
                    quantity: item.quantity,
                  }
                : item
            ),
          })),

        syncStock: (
          id,
          stock
        ) =>

          set((state) => ({
            cart: state.cart.map(
              (item) =>

                item.id === id
                  ? {
                      ...item,
                      stock,
                    }
                  : item
            ),
          })),

        addToCart: (item) =>

          set((state) => {

            const existingItem =
              state.cart.find(
                (cartItem) =>
                  cartItem.id === item.id
              )

            if (existingItem) {

              return {
                cart: state.cart.map(
                  (cartItem) =>

                    cartItem.id === item.id
                      ? {
                          ...cartItem,

                          quantity:
                            cartItem.quantity <
                            cartItem.stock
                              ? cartItem.quantity + 1
                              : cartItem.quantity,
                        }

                      : cartItem
                ),
              }

            }

            return {
              cart: [
                ...state.cart,
                {
                  ...item,
                  quantity: 1,
                },
              ],
            }

          }),

        increaseQuantity: (id) =>

          set((state) => ({
            cart: state.cart.map(
              (item) =>

                item.id === id
                  ? {
                      ...item,

                      quantity:
                        item.quantity <
                        item.stock
                          ? item.quantity + 1
                          : item.quantity,
                    }

                  : item
            ),
          })),

        decreaseQuantity: (id) =>

          set((state) => ({
            cart: state.cart
              .map((item) =>

                item.id === id
                  ? {
                      ...item,

                      quantity:
                        item.quantity - 1,
                    }

                  : item
              )

              .filter(
                (item) =>
                  item.quantity > 0
              ),
          })),

        removeFromCart: (id) =>

          set((state) => ({
            cart: state.cart.filter(
              (item) =>
                item.id !== id
            ),
          })),

        clearCart: () =>

          set({
            cart: [],
          }),

      }),

      {
        name: "hw-shield-cart",
        version: 1,
        migrate: (persistedState: any) => ({
          cart: (persistedState?.cart || []).map(
            (item: any) => ({
              ...item,
              isPreOrder:
                Boolean(item.isPreOrder) ||
                Boolean(item.depositAmount) ||
                Boolean(item.expectedArrival),
            })
          ),
        }),
      }
    )
  )
