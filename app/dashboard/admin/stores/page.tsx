export const dynamic = "force-dynamic";

// DB queries
import { getAllStores } from "@/actions/store";

// Data table
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function AdminStoresPage() {
  // Fetching stores data from the database
  const stores = await getAllStores();

  return (
    <DataTable
      filterValue="name"
      data={stores}
      searchPlaceHolder="Search store name..."
      columns={columns}
    />
  );
}