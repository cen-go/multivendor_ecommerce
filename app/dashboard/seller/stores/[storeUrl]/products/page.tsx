import { getAllStoreProducts } from "@/actions/product";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";

export default async function SellerProductsPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;

  // Fetch products data for the active store from the database
  const products = await getAllStoreProducts(storeUrl);

  if (!products || products.length === 0) {
    return <div className="mt-8 ml-2">
      This store doesn&apos;t have any products to display yet.
    </div>
  }

  return (
    <DataTable
      filterValue="name"
      data={products}
      columns={columns}
      searchPlaceHolder="Search product by name..."
      newTabLink={`/dashboard/seller/stores/${storeUrl}/products/new`}
    />
  );
}
