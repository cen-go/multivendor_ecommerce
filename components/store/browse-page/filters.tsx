import { getAllCategories } from "@/actions/category";
import CategoryFilter from "./filters/category-filter";
import OfferFilter from "./filters/offer-filter";
import PriceFilter from "./filters/price-filter";
import SizeFilter from "./filters/size-filter";
import { getAllOfferTags } from "@/actions/offer-tag";
import FiltersHeader from "./filters/filters-header";
import { ProductQueryFiltersType } from "@/lib/types";

export default async function ProductFilters({
  queries,
}: {
  queries: ProductQueryFiltersType;
}) {
  const { category, subcategory, size, offer, } = queries;

  const categories = await getAllCategories();
  const offers = await getAllOfferTags();

  return (
    <div className="h-full w-48 md:w-60 transition-transform overflow-auto pr-6 pb-2.5 flex-none basis-[196px] overflow-x-hidden scrollbar">
      <FiltersHeader />
      {/* Filters */}
      <div className="border-t w-40 md:w-56">
        <PriceFilter />
        <CategoryFilter categories={categories} />
        <OfferFilter offers={offers} />
        <SizeFilter />
      </div>
    </div>
  );
}
