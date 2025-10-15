// Db queries
import { getProducts } from "@/actions/product";
// Components
import ProductsFilters from "@/components/store/browse-page/filters";
import ProductsSort from "@/components/store/browse-page/sort";
import ProductCard from "@/components/store/cards/product/product-card";
// Types
import { ProductQueryFiltersType } from "@/lib/types";

interface Props {
  searchParams: Promise<ProductQueryFiltersType & {sort: string}>;
}

export default async function BrowsePage({searchParams}: Props) {
  // Extract the URL search params
 const queryParams = await searchParams;
 const {category, subcategory, storeUrl, offer , search, size:sizeQuery, sort} = queryParams;
 const size = Array.isArray(sizeQuery) ? sizeQuery : sizeQuery ? [sizeQuery] :undefined;

  const response = await getProducts({category, subcategory, storeUrl, size, offer, search}, sort);
  const products = response.products

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Filters Sidebar */}
      <div className="border fixed top-[148px] lg:top-32 left-2 md:left-4 pt-4 h-[calc(100vh-64px)] overflow-auto scrollbar">
        <ProductsFilters queries={queryParams} />
      </div>
      {/* Main Content */}
      <div className="ml-[190px] md:ml-[260px] pt-[140px] lg:pt-20">
        {/* Sort Section */}
        <div className="sticky top-[64px] z-10 px-4 py-2 flex items-center">
          <ProductsSort />
        </div>

        {/* Product List */}
        <div className="mt-4 px-4 w-full overflow-y-auto max-h-[calc(100vh-155px)] pb-28 scrollbar flex flex-wrap">
          {products.map((product) => (
            <ProductCard key={product.id + product.slug} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
