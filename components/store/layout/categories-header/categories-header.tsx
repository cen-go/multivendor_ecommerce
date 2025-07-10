import { getAllCategories } from "@/actions/category"
import { getAllOfferTags } from "@/actions/offer-tag";
import CategoriesHeaderContainer from "./container";

export default async function CategoriesHeader() {
  // Fetch all categories and offer tags
  const categories = await getAllCategories();
  const offerTags = await getAllOfferTags();

  return (
    <div className="w-full pt-2 pb-3 px-0 bg-gradient-to-r from-slate-500 to-slate-800">
      <CategoriesHeaderContainer categories={categories} offerTags={offerTags} />
    </div>
  )
}
