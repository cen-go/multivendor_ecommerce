// React Next.js
import Image from "next/image";
import Link from "next/link";
// Types
import { ProductPageDataType } from "@/lib/types";
// Components
import Sku from "./sku";
import RatingStars from "../../shared/rating-stars";
import ProductPrice, { SimplifiedSize } from "./product-price";
import Countdown from "../../shared/countdown";
import { Separator } from "@/components/ui/separator";
import ProductVariantSelector from "./variant-selector";
import SizeSelector from "./size-selector";
import ProductAssurancePolicy from "./assurance-policy";

interface Props {
  productData: ProductPageDataType;
  quantity?: number;
  sizeId: string | undefined;
}

export default function ProductInfo({ productData, sizeId }: Props) {
  if (!productData) {
    return null;
  }

  const {
    name,
    brand,
    sku,
    variantsInfo,
    sizes,
    isSale,
    saleEndDate,
    variantName,
    variantSlug,
    store,
    rating,
    reviewStatistics,
  } = productData;

  const simplifiedSizes: SimplifiedSize[] = sizes.map(size => ({
    id: size.id,
    size: size.size,
    price: size.price,
    quantity: size.quantity,
    discount: size.discount,
  }));

  return (
    <div className="relative w-full">
      {/* Title */}
      <div>
        <h1 className="text-main-primary inline text-xl font-bold leading-5">
          <span className="text-orange-background">{brand}</span> {name} -{" "}
          {variantName}
        </h1>
      </div>
      {/* Sku - Rating - Number of reviews */}
      <div className="flex sm:items-center flex-col sm:flex-row justify-between flex-wrap text-xs mt-2 gap-3">
        {/* Store details */}
        <div className="flex sm:items-center">
          <Link
            href={`/store/${store.url}`}
            className="inline-block mr-2 hover:underline"
          >
            <div className="flex items-center gap-1">
              <Image
                src={store.logo}
                alt="store logo"
                width={30}
                height={30}
                className="w-8 h-8 rounded-full object-cover"
              />
              <p className="text-sm">{store.name}</p>
            </div>
          </Link>
          <Sku sku={sku} />
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-x-2">
          <RatingStars value={rating} />
          <Link href="#reviews" className="text-gray-500 hover:underline">
            (
            {reviewStatistics.totalReviews === 0
              ? "No reviews yet"
              : reviewStatistics.totalReviews === 1
              ? "1 review"
              : `${reviewStatistics.totalReviews} reviews`}
            )
          </Link>
        </div>
      </div>
      {/* Price */}
      <div className="my-6 relative flex flex-col sm:flex-row flex-wrap justify-between">
        <ProductPrice sizeId={sizeId} sizes={simplifiedSizes} />
        {isSale && saleEndDate && (
          <div className="mt-4 pb-2">
            <Countdown targetDate={saleEndDate} />
          </div>
        )}
      </div>
      <Separator />
      {/* Variant switcher */}
      <div className="mt-4 space-y-2">
        {variantsInfo.length > 0 && (
          <ProductVariantSelector
            variants={variantsInfo}
            currentVariantSlug={variantSlug}
          />
        )}
      </div>
      {/* Size Selector */}
      <div className="space-y-2 pb-2 mt-4">
        <div>
          <h1 className="text-main-primary font-bold">Size</h1>
        </div>
        <SizeSelector sizes={sizes} sizeId={sizeId} />
      </div>
      {/* Product assurance */}
      <Separator className="mt-4" />
      <ProductAssurancePolicy />
    </div>
  );
}
