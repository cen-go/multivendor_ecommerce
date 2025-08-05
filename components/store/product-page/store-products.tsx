"use client"

import { useEffect, useState } from "react";
import { getProducts } from "@/actions/product";
import { ProductType } from "@/lib/types";
import ProductList from "../shared/product-list";

interface Props {
  storeUrl: string;
  limit: number;
}

export default function StoreProducts({ storeUrl, limit }: Props) {
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    async function getStoreProducts() {
      const storeProducts = await getProducts({storeUrl,}, "", 1, limit);
      setProducts(storeProducts.products);
    }

    getStoreProducts();
  }, [storeUrl, limit])

  return (
      <div className="mt-4 space-y-1 px-4">
        <ProductList products={products} title="Recommended from this seller" />
      </div>
    )
}
