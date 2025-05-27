import { getAllSubcategories } from "@/actions/subcategory"
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";
import SubcategoryDetails from "@/components/dashboard/forms/subcategory-details";
import { getAllCategories } from "@/actions/category";
import { Plus } from "lucide-react";

export default async function AdminSubcategoriesPage() {
  // Fetch subcategories data from the database
  const subcategories = await getAllSubcategories();

  if (!subcategories || subcategories.length === 0) {
    return <div className="text-center mt-8">No categories to display.</div>;
  }

  // Fetch categories to pass to SubcategoryDetails component
  const categories = await getAllCategories()

  return (
    <DataTable 
      actionButtonText={
        <>
          <Plus size={14} />
          Create subcategory
        </>
      }
      modalChildren={<SubcategoryDetails categories={categories} />}
      newTabLink="/dashboard/admin/subcategories/new"
      filterValue="name"
      searchPlaceHolder="Search subcategory name..."
      data={subcategories}
      columns={columns}
    />
  )
}
