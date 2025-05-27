import { getAllCategories } from "@/actions/category";
import SubcategoryDetails from "@/components/dashboard/forms/subcategory-details";

export default async function AdminNewSubcategoryPage() {
  const categories = await getAllCategories()

  return (
    <div>
      <SubcategoryDetails categories={categories} />
    </div>
  )
}
