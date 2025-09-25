import { getOrder } from "@/actions/order";
import OrderInfoCard from "@/components/store/cards/order/order-info-card";
import OrderTotalDetailsCard from "@/components/store/cards/order/order-total-card";
import OrderUserDetailsCard from "@/components/store/cards/order/order-user-card";
import OrderHeader from "@/components/store/order-page/order-header";
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
    <div className="p-2">
      <OrderHeader order={order} />
      <div
        className="w-full grid "
        style={{
          gridTemplateColumns:
            order.paymentStatus === "PENDING" ||
            order.paymentStatus === "FAILED"
              ? "400px 3fr 1fr"
              : "1fr 4fr",
        }}
      >
        {/* Col 1 --> User, Order details */}
        <div className="h-[calc(100vh-195px)] overflow-auto flex flex-col gap-y-5 scrollbar bg-violet-50">
          {/* User Card */}
          <OrderUserDetailsCard shippingAddress={order.shippingAddress} />
          {/* Order General Info */}
          <OrderInfoCard
            totalItemsCount={totalItemsCount}
            deliveredItemsCount={1}
            paymentDetails={order.paymentDetails}
          />
          {(order.paymentStatus !== "PENDING" &&
            order.paymentStatus !== "FAILED") && (
            <OrderTotalDetailsCard
              details={{
                subTotal: order.subtotal,
                shippingFees: order.shippingFees,
                total: order.total,
              }}
            />
          )}
        </div>
        {/* Col 2 --> Order groups and items */}
        <div className="h-[calc(100vh-195px)] overflow-auto scrollbar bg-emerald-50">
          {/* Order group details */}
        </div>
        {/* Col 3 --> Payment gateways */}
        {(order.paymentStatus === "PENDING" ||
          order.paymentStatus === "FAILED") && (
          <div className="h-[calc(100vh-195px)] overflow-auto scrollbar bg-orange-50 border px-2 py-4 space-y-5">
            {/* Order total details */}
            <OrderTotalDetailsCard
              details={{
                subTotal: order.subtotal,
                shippingFees: order.shippingFees,
                total: order.total,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
