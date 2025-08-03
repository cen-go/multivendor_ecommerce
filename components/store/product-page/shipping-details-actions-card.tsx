"use client"

// React Next.js
import { useEffect, useState } from "react";
// Types
import { CartProductType, ProductShippingDetailsType } from "@/lib/types";
import { Size } from "@prisma/client";
// Utils
import { isProductValidToAdd } from "@/lib/utils";
// Components
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import ReturnPrivacySecurityCard from "./returns-security-privacy-card";
import QuantitySelector from "./quantity-selector";
import { Button } from "../ui/button";

interface Props {
  sizeId: string | undefined;
  shippingDetails: ProductShippingDetailsType;
  cartProductData: CartProductType;
  sizes: Size[];
}

export default function ShippingAndActionsCard({ sizeId, shippingDetails, cartProductData, sizes }: Props) {
// Local state to manage products' state before adding to the cart
const [productToAddToCart, setProductToAddToCart] = useState<CartProductType>(cartProductData);
// state to validate the product before adding to the cart
const [isProductValid, setIsProductValid] = useState<boolean>(false);


useEffect(() => {
  const currentSize = sizes.find(size => sizeId === size.id);

  if (currentSize) {
    const discountedPrice = Math.round(currentSize.price * (1 - currentSize.discount / 100));
    handleChange("sizeId", currentSize.id);
    handleChange("price", discountedPrice);
    handleChange("size", currentSize.size);
    handleChange("stock", currentSize.quantity);
  }
}, [sizeId, sizes]);

useEffect(() => {
  const check  = isProductValidToAdd(productToAddToCart);
  setIsProductValid(check);
}, [productToAddToCart])

function handleChange(property: keyof CartProductType, value: number | string | boolean | undefined) {
  setProductToAddToCart((prevProduct) => ({
    ...prevProduct,
    [property]: value,
  }))
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
                  productId={productToAddToCart.productId}
                  variantId={productToAddToCart.variantId}
                  sizeId={productToAddToCart.sizeId}
                  quantity={productToAddToCart.quantity}
                  handleChange={handleChange}
                  sizes={sizes}
                  stock={productToAddToCart.stock}
                />
              </div>
            )}
            {/* Action Buttons */}
            <Button variant="default" disabled={!isProductValid} className={!isProductValid ? "cursor-not-allowed" : ""}>
              <span>Buy Now</span>
            </Button>
            <Button variant="pink" disabled={!isProductValid} className={!isProductValid ? "cursor-not-allowed" : ""}>
              <span>Add to cart</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
