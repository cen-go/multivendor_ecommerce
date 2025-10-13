"use client";

// React Next.js
import { useCallback, useEffect, useMemo, useState } from "react";
// Types
import { CartProductType, ProductShippingDetailsType } from "@/lib/types";
import { Size } from "@prisma/client";
// Utils
import { isProductValidToAdd, updateProductHistory } from "@/lib/utils";
// Components
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import ReturnPrivacySecurityCard from "./returns-security-privacy-card";
import QuantitySelector from "./quantity-selector";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
// cart state
import { useCartStore } from "@/store/useCartStore";
import useFromStore from "@/hooks/useFromStore";

interface Props {
  sizeId: string | undefined;
  shippingDetails: ProductShippingDetailsType;
  cartProductData: CartProductType;
  sizes: Size[];
}

export default function ShippingAndActionsCard({
  sizeId,
  shippingDetails,
  cartProductData,
  sizes,
}: Props) {
  // Local state to manage products' state before adding to the cart
  const [productToAddToCart, setProductToAddToCart] =
    useState<CartProductType>(cartProductData);
  // state to validate the product before adding to the cart
  const [isProductValid, setIsProductValid] = useState<boolean>(false);

  // Add product to viewed products history in local storage
  updateProductHistory(cartProductData.variantId);

  // Function to update the properties of productToAddToCart state object when the the selected size changes
  const handleChange = useCallback(
    (
      property: keyof CartProductType,
      value: number | string | boolean | undefined
    ) => {
      setProductToAddToCart((prevProduct) => ({
        ...prevProduct,
        [property]: value,
      }));
    },
    []
  );

  // UseEffect to update the cartProduct whenever the selected szie changes
  useEffect(() => {
    const currentSize = sizes.find((size) => sizeId === size.id);

    if (currentSize) {
      const discountedPrice = Math.round(
        currentSize.price * (1 - currentSize.discount / 100)
      );
      handleChange("sizeId", currentSize.id);
      handleChange("price", discountedPrice);
      handleChange("size", currentSize.size);
      handleChange("stock", currentSize.quantity);
    }
  }, [sizeId, sizes, handleChange,]);

  // Upd. shipping details of the product to be added to cart, whenever the country changes
  useEffect(() => {
      handleChange("freeShipping", cartProductData.freeShipping);
      handleChange("extraShippingFee", cartProductData.extraShippingFee);
      handleChange("shippingFee", cartProductData.shippingFee);
      handleChange("deliveryTimeMin", cartProductData.deliveryTimeMin);
      handleChange("deliveryTimeMax", cartProductData.deliveryTimeMax);
      handleChange("shippingMethod", cartProductData.shippingMethod);
      handleChange("shippingService", cartProductData.shippingService);
  }, [shippingDetails.countryName, cartProductData, handleChange]);

  // Validate the data in the productToAddToCart state object
  useEffect(() => {
    const check = isProductValidToAdd(productToAddToCart);
    setIsProductValid(check);
  }, [productToAddToCart]);

  // Get the cart and addToCart state setter fn from the state
  const addToCart = useCartStore(state => state.addToCart);
  const setCart = useCartStore(state => state.setCart);
  const cart = useFromStore(useCartStore, state => state.cart);

  // useEffect to keep the state in sync with the storage
  useEffect(() => {
    function handleStorageChange(event:StorageEvent) {
      if (event.key === "storageCart") {
        try {
          const updatedValue = event.newValue ? JSON.parse(event.newValue) : null;
          // Check if the updated value and state are valid and than update the cart
          if (updatedValue && updatedValue.state && Array.isArray(updatedValue.state.cart)) {
            setCart(updatedValue.state.cart)
          }
        } catch (error) {
          console.error("Failed to parse updated cart data: ", error)
        }
      }
    }

    // Add an event listener to to listen the changes in local storage
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    }
  }, [])
  

  // Check user's cart and the amount already in user's cart than
  // recalculate the maximum amount that can be added to the cart
  const maxQuantity = useMemo(() => {
    const selectedProduct = cart?.find(
      (item) =>
        item.productId === productToAddToCart.productId &&
      item.variantId === productToAddToCart.variantId &&
      item.sizeId === productToAddToCart.sizeId
    );
    return selectedProduct? selectedProduct.stock - selectedProduct.quantity : productToAddToCart.stock
  }, [cart, productToAddToCart]);

  function handleAddToCart() {
    if (maxQuantity <= 0) return;
    addToCart(productToAddToCart);
    handleChange("quantity", 1);
    toast.success("Product added to cart.")
  }

  return (
    <div className="w-[340px] sm:w-[390px]">
      <div className="z-20">
        <div className="bg-white border rounded-md overflow-hidden overflow-y-auto p-4 pb-2">
          {/* Ship to */}
          {shippingDetails && (
            <>
              <ShipTo
                countryCode={shippingDetails.countryCode}
                countryName={shippingDetails.countryName}
              />
              <div className="mt-3">
                <ShippingDetails
                  shippingDetails={shippingDetails}
                  quantity={productToAddToCart.quantity}
                  weight={cartProductData.weight}
                />
              </div>
            </>
          )}
          <ReturnPrivacySecurityCard
            returnPolicy={shippingDetails.returnPolicy}
          />
          {/* Action buttons */}
          <div className="mt-5 bg-white bottom-0 pb-4 space-y-3 sticky">
            {/* Quantity selector */}
            {sizeId && (
              <div className="w-full flex justify-end mt-4">
                <QuantitySelector
                  sizeId={productToAddToCart.sizeId}
                  quantity={productToAddToCart.quantity}
                  handleChange={handleChange}
                  stock={productToAddToCart.stock}
                  maxQuantity={maxQuantity}
                />
              </div>
            )}
            {/* Action Buttons */}
            <Button
              variant="default"
              disabled={!isProductValid}
              className={!isProductValid ? "cursor-not-allowed" : ""}
            >
              <span>Buy Now</span>
            </Button>
            <Button
              variant="pink"
              disabled={!isProductValid || maxQuantity <= 0}
              className={!isProductValid || maxQuantity <= 0 ? "cursor-not-allowed" : ""}
              onClick={handleAddToCart}
            >
              <span>Add to cart</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
