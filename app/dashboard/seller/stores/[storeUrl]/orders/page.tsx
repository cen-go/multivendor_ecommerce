import DataTable from "@/components/ui/data-table"
import { columns } from "./columns";
import { getStoreOrders } from "@/actions/store";

export default async function SellerOrdersPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const { storeUrl } = await params;

  const orders = await getStoreOrders(storeUrl);

  if (!orders || orders.length === 0) {
    return <div className="text-center mt-8">No orders to display.</div>;
  }

  return (
    <div>
      <DataTable
        filterValue="id"
        data={orders}
        columns={columns}
        searchPlaceHolder="Search order by ID ..."
      />
    </div>
  );
}
