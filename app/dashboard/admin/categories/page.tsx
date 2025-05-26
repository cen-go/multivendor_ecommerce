// Queries
import { getAllCategories } from "@/actions/category"
import CategoryDetails from "@/components/dashboard/forms/category-details";
// Components
import DataTable from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import { columns } from "./columns";

export default async function AdminCategoriesPage() {
  // Fetching Categories data from the database
  const categories = await getAllCategories();

  if (!categories || categories.length === 0) {
    return <div className="text-center mt-8">No categories to display.</div>;
  }

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={14} />
          Create category
        </>
      }
      modalChildren={<CategoryDetails />}
      filterValue="name"
      searchPlaceHolder="Search category name..."
      data={categories}
      columns={columns}
    />
  );
}
