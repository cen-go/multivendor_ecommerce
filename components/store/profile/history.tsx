"use client"

// React
import { useEffect, useState } from "react";
// Types & db Queries
import { ProductType } from "@/lib/types";
import { getProductsByArrayOfIds } from "@/actions/product";

import Pagination from "@/components/shared/pagination";
import toast from "react-hot-toast";
import ProductList from "../shared/product-list";
import { MoonLoader } from "react-spinners";

export default function History({page}: {page: number}) {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getHistory() {
      setLoading(true);
      try {
        // Fetch history of variand IDs stored in local storage
        const historyJsonData = localStorage.getItem("productHistory");

        if (!historyJsonData) {
          setProducts([]);
          return;
        }

        const viewedhistory = JSON.parse(historyJsonData);

        // Fetch the products with corresponding IDs from db
        const response = await getProductsByArrayOfIds({
          variantIds: viewedhistory,
          page: page
        });
        setTotalPages(response.totalPages);
        setProducts(response.products);
      } catch (error: unknown) {
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    getHistory();
  }, [page]);

  return (
    <div className="bg-white py-4 px-6">
      <h1 className="text-lg mb-3 font-bold">Your product view history</h1>
      {loading ? (
        <div className="mx-auto h-full flex items-center justify-center py-24">
          <MoonLoader color="#d3031c" speedMultiplier={0.5} size={40} />
        </div>
      ) : products.length > 0 ? (
        <div className="pb-16">
          <ProductList products={products} />
          <div className="mt-2">
            <Pagination
              page={page}
              totalPages={totalPages}
              pathname="/profile/history"
            />
          </div>
        </div>
      ) : (
        <div>No products</div>
      )}
    </div>
  );
}
