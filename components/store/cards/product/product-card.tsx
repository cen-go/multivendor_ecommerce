"use client"

// React & Next.js
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
// Types
import { ProductType, VariantSimplified } from "@/lib/types";
// Components
import RatingStars from "@/components/store/shared/rating-stars";
import { Button } from "@/components/store/ui/button";
import ProductCardImageSwiper from "./swiper";
import VariantSwitcher from "./variant-switcher";
import ProductPrice from "../../product-page/product-info/product-price";
// Packages
import toast from "react-hot-toast";
// Icons
import { HeartIcon } from "lucide-react";
// clerk
import { useUser } from "@clerk/nextjs";
// Server actions and queries
import { addToWishlist } from "@/actions/user";

export default function ProductCard({product}: {product: ProductType}) {
  const { name, slug, rating, sales, variants, variantImages } = product;
  const [variant, SetVariant] = useState<VariantSimplified>(variants[0]);
  const { variantName, variantSlug, images, sizes } = variant;
  const user = useUser();
  const pathname = usePathname();

  async function handleAddToWishlist() {
    if (!user.isSignedIn) {
      toast(() => (
        <span>
          You need to{" "}
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
            className="underline text-orange-secondary font-bold"
          >
            Sign in{" "}
          </Link>
          to add an item to your wishlist.
        </span>
      ));
      return;
    }
    const res = await addToWishlist(product.id, variant.variantId);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div>
      <div className="group w-48 sm:w-[225px] relative transition-all duration-75 bg-white ease-in-out p-4 rounded-t-3xl border border-transparent hover:shadow-xl hover:border-border">
        <div className="relative w-full h-full">
          <Link
            href={`/product/${slug}/${variantSlug}`}
            className="w-full relative inline-block overflow-hidden"
          >
            {/* Images Swiper */}
            <ProductCardImageSwiper images={images} />
            {/* Title */}
            <div className="text-sm text-main-primary h-[18px] overflow-hidden overflow-ellipsis line-clamp-1">
              {name} - {variantName}
            </div>
            {/* Rating - Sales */}
            {rating > 0 && (
              <div className="flex items-center gap-x-1 h-5">
                <RatingStars value={rating} />
                <div className="text-xs text-main-secondary">{sales} sold</div>
              </div>
            )}
            {/* Price */}
            <ProductPrice sizeId="" sizes={sizes} isCard />
          </Link>
        </div>
        <div className="hidden group-hover:block absolute -left-[1px] bg-white border border-t-0 w-[calc(100%+2px)] px-4 pb-4 rounded-b-3xl shadow-xl z-30 space-y-2">
          {/* Variant switcher */}
          <VariantSwitcher
            images={variantImages}
            variants={variants}
            selectedVariant={variant}
            setVariant={SetVariant}
          />
          {/* Action buttons */}
          <div className="flex items-center gap-x-1">
            <Button>Add to cart</Button>
            <Button
              variant="black"
              size="icon"
              onClick={handleAddToWishlist}
              aria-label="Add item to wishlist"
            >
              <HeartIcon className="w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
