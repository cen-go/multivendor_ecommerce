import { getUserOrders, UserOrdersFilter } from "@/actions/profile";
import OrdersTable from "@/components/store/profile/orders-table";

export default async function FilteredOrdersPage({params}: {params: Promise<{filter: string}>}) {
  const filter = ((await params).filter as UserOrdersFilter) || "all";
  const ordersData = await getUserOrders({filter: filter});
  
    return (
      <div>
        <OrdersTable
          orders={ordersData.orders}
          totalPages={ordersData.totalPages}
          initialFilter={filter}
        />
      </div>
    );
}