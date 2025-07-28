// Types
import { ProductPageDataType } from "@/lib/types";
import { ReactNode } from "react";
// Components
import ProductImageSwiper from "./product-images-swiper";
import ProductInfo from "./product-info/product-info";
import ShipTo from "./shipping/ship-to";
import ShippingDetails from "./shipping/shipping-details";

interface Props {
  children: ReactNode;
  productData: ProductPageDataType;
  sizeId: string | undefined;
}

export default function ProductPageContainer({children, productData, sizeId}: Props) {
  if (!productData) {
    return null;
  }

  const weight = productData.weight ? productData.weight.toNumber() : null;
  const { shippingDetails } = productData;
  return (
    <div className="relative">
      <div className="w-full xl:flex xl:gap-4">
        {/* Product image swiper */}
        <ProductImageSwiper images={productData.images} />
        <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 md:flex-row">
          {/* Product main info */}
          <ProductInfo productData={productData} sizeId={sizeId} />
          {/* Shipping details - Buy actions buttons */}
          <div className="w-[390px]">
            <div className="z-20">
              <div className="bg-white border rounded-md overflow-hidden overflow-y-auto p-4 pb-0">
                {/* Ship to */}
                {shippingDetails && (
                  <>
                    <ShipTo
                      countryCode={shippingDetails.countryCode}
                      countryName={shippingDetails.countryName}
                    />
                    <div className="mt-3 space-y-3">
                      <ShippingDetails shippingDetails={shippingDetails} quantity={1} weight={weight} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[calc(100%-390px)] mt-6 pb-16">{children}</div>
    </div>
  );
}
