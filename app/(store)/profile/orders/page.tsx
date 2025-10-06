import { getUserOrders } from "@/actions/profile"
import OrdersTable from "@/components/store/profile/orders-table";

export default async function UserOrdersPage() {
  const ordersData = await getUserOrders({});

  return (
    <div>
      <OrdersTable orders={ordersData.orders} totalPages={ordersData.totalPages} />
    </div>
  )
}