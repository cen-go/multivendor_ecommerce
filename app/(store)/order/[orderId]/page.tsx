// React & Next.js
import { redirect } from "next/navigation";
// Server actions
import { getOrder } from "@/actions/order";
// Components
import OrderInfoCard from "@/components/store/cards/order/order-info-card";
import OrderTotalDetailsCard from "@/components/store/cards/order/order-total-card";
import OrderUserDetailsCard from "@/components/store/cards/order/order-user-card";
import OrderGroupTable from "@/components/store/order-page/order-group-table";
import OrderHeader from "@/components/store/order-page/order-header";
import OrderPayment from "@/components/store/order-page/order-payment";
// Types
import { OrderExtendedType } from "@/lib/types";
// Utils
import { calculateShippingDateRange } from "@/lib/utils";

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

  // extract order groups and arrange delivery details for each individeual group
  const {orderGroups} = order;
  const deliveryDetails = orderGroups.map((group) => {
      const { minDate, maxDate } = calculateShippingDateRange(
        group.deliveryTimeMin,
        group.deliveryTimeMax,
        group.createdAt
      );
  
      return {
        shippingService: group.shippingService,
        deliveryMinDate: minDate,
        deliveryMaxDate: maxDate,
      };
    });

  return (
    <div className="p-2">
      <OrderHeader order={order} />
      <div
        className="w-full grid max-w-[1400px] mx-auto"
        style={{
          gridTemplateColumns:
            order.paymentStatus === "PENDING" ||
            order.paymentStatus === "FAILED"
              ? "320px 3fr 1fr"
              : "1fr 4fr",
        }}
      >
        {/* Col 1 --> User, Order details */}
        <div className="h-[calc(100vh-195px)] overflow-auto flex flex-col gap-y-5 scrollbar">
          {/* User Card */}
          <OrderUserDetailsCard shippingAddress={order.shippingAddress} />
          {/* Order General Info */}
          <OrderInfoCard
            totalItemsCount={totalItemsCount}
            deliveredItemsCount={1}
            paymentDetails={order.paymentDetails}
          />
          {order.paymentStatus !== "PENDING" &&
            order.paymentStatus !== "FAILED" && (
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
        <div className="h-[calc(100vh-195px)] overflow-auto scrollbar">
          {/* Order group details */}
          <section className="p-2 relative w-full space-y-4">
            {orderGroups.map((group, index) => {
              const deliveryInfo = deliveryDetails[index];
            return <OrderGroupTable deliveryInfo={deliveryInfo} group={group} key={group.id} check />;
          })}
          </section>
        </div>
        {/* Col 3 --> Payment gateways */}
        {(order.paymentStatus === "PENDING" ||
          order.paymentStatus === "FAILED") && (
          <div className="h-[calc(100vh-195px)] overflow-auto scrollbar border px-2 py-4 space-y-5">
            {/* Order total details */}
            <OrderTotalDetailsCard
              details={{
                subTotal: order.subtotal,
                shippingFees: order.shippingFees,
                total: order.total,
              }}
            />
            <OrderPayment orderId={order.id} amount={order.total} />
          </div>
        )}
      </div>
    </div>
  );
}
