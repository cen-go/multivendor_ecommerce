"use client"

import useFromStore from "@/hooks/useFromStore";
import { CartProductType, UserCountry } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";
import { useEffect, useState } from "react";
import CartHeader from "./cart-header";
import CartProduct from "../cards/cart-product-card";
import CartSummary from "./summary";
import FastDelivery from "../cards/fast-delivery";
import { SecurityPrivacyCard } from "../product-page/security-privacy-card";
import EmptyCart from "./empty-cart";
import { validateCartProducts } from "@/actions/user";
import { PulseLoader } from "react-spinners";

export default function CartContainer({userCountry}: {userCountry: UserCountry}) {
  const cartItems = useFromStore(useCartStore, state => state.cart);
  const totalItems = useFromStore(useCartStore, state => state.totalItems);
  const setCart = useCartStore(state => state.setCart);
  const [loading, setLoading] = useState(true);
  const [isCartLoaded, setIsCartLoaded] = useState(false)
  const [selectedItems, setSelectedItems] = useState<CartProductType[]>([]);
  const [shippingFees, setShippingFees] = useState<{uniqueId: string; shippingFee: number;}[]>([]);

  useEffect(() => {
    if (cartItems !== undefined) {
      setIsCartLoaded(true);
    } else {
      setIsCartLoaded(false)
    }
  }, [cartItems])
  
  // Update the cart State when user country or isCartLoaded state changes
  // in order to keep shipping information up to date with the database
  useEffect(() => {
    async function loadAndSyncCart() {
      if (cartItems && cartItems?.length > 0) {
        try {
          setLoading(true);
          const validatedCart = await validateCartProducts(cartItems);
          setCart(validatedCart as CartProductType[]);
          setLoading(false);
        } catch (error) {
          console.error("Failed to sync cart: ", error);
          setLoading(false);
        }
      }
    }
    loadAndSyncCart();
  }, [userCountry, isCartLoaded]);

  const totalShippingFee = shippingFees.reduce((total, fee) => total + fee.shippingFee ,0);
  return (
    <div>
      {cartItems && cartItems.length > 0 && totalItems ? (
        <>
        {loading ?  (
          <div className="py-24 mx-auto flex justify-center"><PulseLoader color="#ffbcbe" /></div>
        ): (
          <div className="bg-[#f5f5f5]">
          <div className="max-w-[1200px] mx-auto py-6 px-3 flex flex-col lg:flex-row gap-6">
            <div className="min-w-0 flex-1">
              <CartHeader
                cartItems={cartItems}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                totalItems={totalItems}
              />
              <div className="h-auto overflow-x-hidden overflow-auto mt-2">
                {cartItems.map((item) => (
                  <CartProduct
                    key={item.sizeId}
                    product={item}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    setShippingFees={setShippingFees}
                  />
                ))}
              </div>
            </div>
            {/* Cart side */}
            <div className="sticky top-4 w-[380px] max-h-max">
              <CartSummary cartItems={cartItems} totalShipping={totalShippingFee} />
              <div className="mt-2 bg-white px-6 p-4">
                <FastDelivery />
              </div>
              <div className="mt-2 bg-white px-6 p-4">
                <SecurityPrivacyCard />
              </div>
            </div>
          </div>
        </div>
        )}
        </>
        
      ) : (
        <EmptyCart />
      )}
    </div>
  )
}
