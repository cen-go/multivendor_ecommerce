import { getOrder } from "@/actions/order";
import { OrderExtendedType } from "@/lib/types";
import { redirect } from "next/navigation";

export default async function OrderPage({params}: {params: Promise<{orderId: string}>}) {
  const { orderId } = await params;

  const order: OrderExtendedType = await getOrder(orderId);

  if (!order) redirect("/");

  const totalItemsCount = order.orderGroups.reduce(
    (totalSum, group) =>  // add total quantity of each individual group
      totalSum +
      group.orderItems.reduce((grSum, item) => grSum + item.quantity, 0), // calculate Tot. quantity of items in each group
    0
  );

  console.log(totalItemsCount);

  return (
    <div>OrderPage, Order ID: {orderId}</div>
  )
}
