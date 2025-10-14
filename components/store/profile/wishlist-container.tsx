"use client";

import { ProductWishlistType } from "@/lib/types";
import ProductList from "@/components/store/shared/product-list";
import Pagination from "../../shared/pagination";

export default function WishlistContainer({
  products,
  page,
  totalPages,
}: {
  products: ProductWishlistType[];
  page: number;
  totalPages: number;
}) {

  return (
    <div>
      <div className="flex flex-wrap pb-16">
        <ProductList products={products} />
      </div>
      <Pagination page={page} pathname="/profile/wishlist" totalPages={totalPages} />
    </div>
  );
}