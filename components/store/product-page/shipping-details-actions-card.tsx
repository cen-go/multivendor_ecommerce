"use client"

import { CartProductType, ProductPageDataType, ProductShippingDetailsType } from "@/lib/types";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";
import ReturnPrivacySecurityCard from "./returns-security-privacy-card";
import { useEffect, useState } from "react";
import { isProductValidToAdd } from "@/lib/utils";
import { Size } from "@prisma/client";

interface Props {
  productData: ProductPageDataType;
  sizeId: string | undefined;
  shippingDetails: ProductShippingDetailsType;
  cartProductData: CartProductType;
  //currentSize: Size | undefined;
}

export default function ShippingAndActionsCard({productData, sizeId, shippingDetails, cartProductData, }: Props) {
// Local state to manage products' state before adding to the cart
const [productToAddToCart, setProductToAddToCart] = useState<CartProductType>(cartProductData);
// state to validate the product before adding to the cart
const [isProductValid, setIsProductValid] = useState<boolean>(false);


useEffect(() => {
  const currentSize = productData?.sizes.find(size => sizeId === size.id);

  if (currentSize) {
    const discountedPrice = Math.round(currentSize.price * (1 - currentSize.discount / 100));
    handleChange("sizeId", currentSize.id);
    handleChange("price", discountedPrice);
    handleChange("size", currentSize.size);
    handleChange("stock", currentSize.quantity);
  }
}, [sizeId, productData]);

useEffect(() => {
  const check  = isProductValidToAdd(productToAddToCart);
  setIsProductValid(check);
  console.log("is product valit to add to cart", check);
}, [productToAddToCart])

if (!productData) {
  return null;
}

function handleChange(property: keyof CartProductType, value: number | string | boolean | undefined) {
  setProductToAddToCart((prevProduct) => ({
    ...prevProduct,
    [property]: value,
  }))
}

console.log("Product to add cart ", productToAddToCart);




  return (
    <div className="w-[390px]">
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
                  quantity={1}
                  weight={cartProductData.weight}
                />
              </div>
            </>
          )}
          <ReturnPrivacySecurityCard
            returnPolicy={shippingDetails.returnPolicy}
          />
        </div>
      </div>
    </div>
  );
}
