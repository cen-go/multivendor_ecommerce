// Types
import { ProductPageDataType } from "@/lib/types";
import { ReactNode } from "react";
// Components
import ProductImageSwiper from "./product-images-swiper";
import ProductInfo from "./product-info/product-info";

interface Props {
  children: ReactNode;
  productData: ProductPageDataType;
  sizeId: string | undefined;
}

export default function ProductPageContainer({children, productData, sizeId}: Props) {
  if (!productData) {
    return null;
  }
  return (
    <div className="relative">
      <div className="w-full xl:flex xl:gap-4">
        {/* Product image swiper */}
        <ProductImageSwiper images={productData.images} />
        <div className="w-full mt-4 md:mt-0 flex flex-col gap-4 md:flex-row">
          {/* Product main info */}
          <ProductInfo productData={productData} sizeId={sizeId} />
          {/* Buy actions card */}
        </div>
      </div>
      <div className="w-[calc(100%-390px)] mt-6 pb-16">{children}</div>
    </div>
  )
}
