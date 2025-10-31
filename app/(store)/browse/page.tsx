// Db queries
import { getProducts } from "@/actions/product";
// Components
import ProductsFilters from "@/components/store/browse-page/filters";
import ProductsSort from "@/components/store/browse-page/sort";
import ProductCard from "@/components/store/cards/product/product-card";
// Types
import { ProductQuerySortingOptions } from "@/lib/types";

const SORT_OPTIONS = [
  "",
  "most-popular",
  "new-arrivals",
  "top-rated",
  "price-low-to-high",
  "price-high-to-low",
] as const;

function isSortOptionValid(value: unknown): value is ProductQuerySortingOptions {
  return typeof value === "string" && (SORT_OPTIONS as readonly string[]).includes(value);
}

interface Props {
  searchParams: Promise<{
    category: string;
    subcategory: string;
    storeUrl: string;
    search: string;
    offer: string;
    size: string[];
    minPrice: string;
    maxPrice: string;
    sort: string;
  }>;
}

export default async function BrowsePage({searchParams}: Props) {
  // Extract the URL search params
 const queryParams = await searchParams;
 const {category, subcategory, storeUrl, offer , search, size:sizeQuery, sort, minPrice, maxPrice} = queryParams;
 const size = Array.isArray(sizeQuery) ? sizeQuery : sizeQuery ? [sizeQuery] : undefined;

 // Check if sorting value is a valid option, fallback to empty string if not
 const sortValue: ProductQuerySortingOptions = isSortOptionValid(sort) ? sort : "most-popular"

  const response = await getProducts(
    {
      category,
      subcategory,
      storeUrl,
      size,
      offer,
      search,
      minPrice: Number(minPrice) || 0,
      maxPrice: Number(maxPrice) || undefined,
    },
    sortValue
  );
  const products = response.products;

  return (
    <div className="flex h-screen overflow-hidden max-w-[1440px] mx-auto px-2 md:px-4 2xl:px-0">
      {/* Filters Sidebar */}
      <div className="border-r top-[148px] lg:top-32 pt-4 h-[calc(100vh-64px)] overflow-auto scrollbar">
        <ProductsFilters
          queries={{
            ...queryParams,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
          }}
        />
      </div>
      {/* Main Content */}
      <div className="flex-1 pt-[40px] lg:pt-10">
        {/* Sort Section */}
        <div className="sticky top-[30px] z-10 px-4 py-2 flex items-center">
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
