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
  setCart: (newCart: CartProductType[]) => void; // re-sets the cart after switching country etc.
}

// Default state
const INITIAL_STATE: State = {
  cart: [],
  totalItems: 0,
  totalPrice: 0,
};

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
      updateProductQuantity: (product, quantity) => {
        const cart = get().cart;
        // If quantity is 0 or less remove the item
        if (quantity <= 0) {
          get().removeFromCart(product);
        }
        const updatedCart = cart.map((item) =>
          item.productId === product.productId &&
          item.variantId === product.variantId &&
          item.sizeId === product.sizeId
            ? { ...item, quantity }
            : item
        );

        set(() => ({
          cart: updatedCart,
          totalItems: updatedCart.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedCart.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          ),
        }));
      },
      removeFromCart: (product) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              !(
                item.productId === product.productId &&
                item.variantId === product.variantId &&
                item.sizeId === product.sizeId
              )
          ),
          totalItems: state.totalItems - product.quantity,
          totalPrice: state.totalPrice - product.price * product.quantity,
        }));
      },
      removeMultipleFromCart: (products) => {
        products.map((product) => get().removeFromCart(product));
      },
      emptyCart() {
        set(() => ({
          cart: INITIAL_STATE.cart,
          totalItems: INITIAL_STATE.totalItems,
          totalPrice: INITIAL_STATE.totalPrice,
        }));
      },
      setCart(newCart) {
        const totalItems = newCart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        set(() => ({
          cart: newCart,
          totalItems,
          totalPrice,
        }));
      },
    }),
    { name: "storageCart" }
  )
);
