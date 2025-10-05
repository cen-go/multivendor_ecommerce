import { getUserOrders } from "@/actions/profile"

export default async function UserOrdersPage() {
  const orders = await getUserOrders({});

  return (
    <div>UserOrdersPage</div>
  )
}