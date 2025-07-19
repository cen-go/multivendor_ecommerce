import { ProductPageDataType } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import Sku from "./sku";
import RatingStars from "../../shared/rating-stars";
import ProductPrice, { SimplifiedSize } from "./product-price";

interface Props {
  productData: ProductPageDataType;
  quantity?: number;
  sizeId: string | undefined;
}

export default function ProductInfo({ productData, sizeId, quantity }: Props) {
  if (!productData) {
    return null;
  }

  const {
    productId,
    name,
    sku,
    colors,
    variantImages,
    sizes,
    isSale,
    saleEndDate,
    variantName,
    store,
    rating,
    numReviews,
  } = productData;

  const simplifiedSizes: SimplifiedSize[] = sizes.map(size => ({
    id: size.id,
    size: size.size,
    price: size.price,
    quantity: size.quantity,
    discount: size.discount,
  }));

  return (
    <div className="relative w-full xl:w-[540px]">
      {/* Title */}
      <div>
        <h1 className="text-main-primary inline text-xl font-bold leading-5">
          {name} - {variantName}
        </h1>
      </div>
      {/* Sku - Rating - Number of reviews */}
      <div className="flex items-center text-xs mt-2 gap-1">
        {/* Store details */}
        <Link
          href={`/store/${store.url}`}
          className="inline-block mr-2 hover:underline"
        >
          <div className="flex items-center w-full gap-1">
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
        <div className="flex items-center gap-x-2 flex-1 ml-6 whitespace-nowrap">
          <RatingStars value={rating} />
          <Link href="#reviews" className="text-gray-500 hover:underline">
            (
            {numReviews === 0
              ? "No reviews yet"
              : numReviews === 1
              ? "1 review"
              : `${numReviews} reviews`}
            )
          </Link>
        </div>
      </div>
      {/* Price */}
      <div className="my-6 relative flex flex-col sm:flex-row justify-between">
        <ProductPrice sizeId={sizeId} sizes={simplifiedSizes} />
      </div>
    </div>
  );
}
