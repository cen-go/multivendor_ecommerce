// Types
import { CartProductType, ProductPageDataType } from "@/lib/types";
import { ReactNode } from "react";
// Components
import ProductImageSwiper from "./product-images-swiper";
import ProductInfo from "./product-info/product-info";
import ShippingAndActionsCard from "./shipping-details-actions-card";

interface Props {
  children: ReactNode;
  productData: ProductPageDataType;
  sizeId: string | undefined;
}

export default function ProductPageContainer({children, productData, sizeId}: Props) {
  if (!productData) {
    return null;
  }

  const { shippingDetails, weight } = productData;

  const cartProductData: CartProductType = {
    productId: productData.productId,
    variantId: productData.variantId,
    productSlug: productData.productSlug,
    variantSlug: productData.variantSlug,
    name: productData.name,
    variantName: productData.variantName,
    image: productData.images[0].url,
    variantImage: productData.variantImage,
    sizeId: sizeId ?? "",
    size: "",
    quantity: 1,
    price: 0,
    stock: 1,
    weight: weight,
    shippingMethod: shippingDetails.shippingFeeMethod,
    shippingService: shippingDetails.shippingService,
    shippingFee: shippingDetails.shippingFee,
    extraShippingFee: shippingDetails.extraShippingFee,
    deliveryTimeMin: shippingDetails.deliveryTimeMin,
    deliveryTimeMax: shippingDetails.deliveryTimeMax,
    freeShipping: shippingDetails.freeShipping,
  };

  return (
    <div className="relative w-full">
      <div className="w-full lg:flex lg:gap-4">
        {/* Product image swiper */}
        <ProductImageSwiper images={productData.images} />
        <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 md:flex-row">
          {/* Product main info */}
          <ProductInfo productData={productData} sizeId={sizeId} />
          {/* Shipping details - Buy actions buttons */}
          <ShippingAndActionsCard
            productData={productData}
            sizeId={sizeId}
            shippingDetails={shippingDetails}
            cartProductData={cartProductData}
          />
        </div>
      </div>
      <div className="w-[calc(100%-390px)] mt-6 pb-16">{children}</div>
    </div>
  );
}
