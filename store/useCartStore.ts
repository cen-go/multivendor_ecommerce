import { create } from "zustand";
import { CartProductType } from "@/lib/types";
import { persist } from "zustand/middleware";

// Interface of the cart state
interface State {
  cart: CartProductType[];
  totalItems: number;
  totalPrice: number;
}

// Interface of the actions that can be performed in the Cart
interface Actions {
  addToCart: (item: CartProductType) => void;
  removeFromCart: (item: CartProductType) => void;
  removeMultipleFromCart: (items: CartProductType[]) => void;
  updateProductQuantity: (item: CartProductType, quantity: number) => void;
  emptyCart: () => void;
}

// Default state
const INITIAL_STATE: State = {
 cart: [],
 totalItems: 0,
 totalPrice: 0,
}

// Create the store with Zustand, combining the status interface and actions
export const useCartStore = create(
  persist<State & Actions>(
    (set, get) => ({
      cart: INITIAL_STATE.cart,
      totalItems: INITIAL_STATE.totalItems,
      totalPrice: INITIAL_STATE.totalPrice,
      addToCart: (product: CartProductType) => {
        const cart = get().cart;
        // Check if product already exists in the cart
        const existingItem = cart.find(
          (item) =>
            item.productId === product.productId &&
            item.variantId === product.variantId &&
            item.sizeId === product.sizeId
        );
        if (existingItem) {
          const updatedCart = cart.map((item) =>
            item.productId === product.productId &&
            item.variantId === product.variantId &&
            item.sizeId === product.sizeId
              ? { ...item, quantity: item.quantity + product.quantity }
              : item
          );

          set((state) => ({
            cart: updatedCart,
            totalItems: state.totalItems + product.quantity,
            totalPrice: state.totalPrice + product.price * product.quantity,
          }));
        } else {
          const updatedCart = [...cart, { ...product }];

          set((state) => ({
            cart: updatedCart,
            totalItems: state.totalItems + product.quantity,
            totalPrice: state.totalPrice + product.price * product.quantity,
          }));
        }
      },
      updateProductQuantity(item, quantity) {},
      removeFromCart(item) {},
      removeMultipleFromCart(items) {},
      emptyCart() {},
    }),
    { name: "storageCart" }
  )
);