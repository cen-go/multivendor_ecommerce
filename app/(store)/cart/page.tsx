"use client"

import CartProduct from "@/components/store/cards/cart-product-card";
import FastDelivery from "@/components/store/cards/fast-delivery";
import CartHeader from "@/components/store/cart-page/cart-header";
import { SecurityPrivacyCard } from "@/components/store/product-page/security-privacy-card";
import useFromStore from "@/hooks/useFromStore";
import { CartProductType } from "@/lib/types";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";

export default function CartPage() {
  const cartItems = useFromStore(useCartStore, state => state.cart);
  const totalItems = useFromStore(useCartStore, state => state.totalItems);
  const [selectedItems, setSelectedItems] = useState<CartProductType[]>([]);
  const [totalShipping, setTotalShipping] = useState<number>(0);

  return (
    <div>
      {cartItems && cartItems.length > 0 && totalItems ? (
        <div className="bg-[#f5f5f5]">
          <div className="max-w-[1200px] mx-auto py-6 px-3 flex flex-col lg:flex-row">
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
                    setTotalShipping={setTotalShipping}
                  />
                ))}
              </div>
            </div>
            {/* Cart side */}
            <div className="sticky top-4 ml-5 w-[380px] max-h-max">
              CART SUMMARY
              <div className="mt-2 bg-white px-6 p-4">
                <FastDelivery />
              </div>
              <div className="mt-2 bg-white px-6 p-4">
                <SecurityPrivacyCard />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>Your cart is empty.</div>
      )}
    </div>
  );
}
