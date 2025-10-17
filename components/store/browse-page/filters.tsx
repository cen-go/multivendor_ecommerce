// Server actions and db queries
import { getAllCategories } from "@/actions/category";
import { getAllOfferTags } from "@/actions/offer-tag";
// Components
import CategoryFilter from "./filters/category-filter";
import OfferFilter from "./filters/offer-filter";
import PriceFilter from "./filters/price-filter";
import SizeFilter from "./filters/size-filter";
import FiltersHeader from "./filters/filters-header";
// Types
import { ProductQueryFiltersType } from "@/lib/types";

export default async function ProductFilters({
  queries,
}: {
  queries: ProductQueryFiltersType;
}) {
  const categories = await getAllCategories();
  const offers = await getAllOfferTags();

  return (
    <div className="h-full w-48 md:w-60 transition-transform overflow-auto pr-6 pb-2.5 flex-none basis-[196px] overflow-x-hidden scrollbar">
      <FiltersHeader queries={queries} />
      {/* Filters */}
      <div className="border-t w-40 md:w-56">
        <PriceFilter />
        <CategoryFilter categories={categories} />
        <SizeFilter queries={queries} />
        <OfferFilter offers={offers} />
      </div>
    </div>
  );
}
