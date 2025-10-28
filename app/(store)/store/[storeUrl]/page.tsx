import { getProducts } from "@/actions/product";
import { getStorePageDetails } from "@/actions/store";
import ProductSort from "@/components/store/browse-page/sort";
import StoreDetails from "@/components/store/store-page/store-details";
import StoreProducts from "@/components/store/store-page/store-products";
import { notFound } from "next/navigation";

export default async function StorePage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;

  const store = await getStorePageDetails(storeUrl);

  if (!store) return notFound();

  const { products } = await getProducts({storeUrl}, "most-popular", 1, 100);

  return (
      <div className="max-w-[1440px] mx-auto px-2 ">
        <StoreDetails details={store} />
        <div className="mt-8 md:mt-14">
            <div className="pt-4 ">
              <div className="md:ml-5">
                <ProductSort />
              </div>
              <div className="-ml-6 md:ml-0">
                <StoreProducts
                  products={products}
                />
              </div>
            </div>
          </div>
      </div>
  );
}