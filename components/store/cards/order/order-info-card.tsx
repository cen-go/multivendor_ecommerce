import { PaymentDetails } from "@prisma/client";

export default function OrderInfoCard({
  totalItemsCount,
  deliveredItemsCount,
  paymentDetails,
}: {
  totalItemsCount: number;
  deliveredItemsCount: number;
  paymentDetails: PaymentDetails | null;
}) {
  return (
    <div className="p-4 shadow-sm w-full flex justify-between">
      <div className="space-y-4">
        <p className="text-main-secondary text-sm">Total Items</p>
        <p className="text-main-secondary text-sm">Delivered</p>
        <p className="text-main-secondary text-sm">Payment Status</p>
        <p className="text-main-secondary text-sm">Payment Method</p>
        <p className="text-main-secondary text-sm">Payment Refrence</p>
        <p className="text-main-secondary text-sm">Paid at</p>
      </div>
      <div className="text-right space-y-4">
        <p className=" text-neutral-500 text-sm">{totalItemsCount}</p>
        <p className="mt-0.5 text-neutral-500 text-sm">{deliveredItemsCount}</p>
        <p className="mt-0.5 text-neutral-500 text-sm">
          {paymentDetails ? paymentDetails.status : "Unpaid"}
        </p>
        <p className="mt-0.5 text-neutral-500 text-sm">
          {paymentDetails ? paymentDetails.paymentMethod : "-"}
        </p>
        <p className="pt-0.5 text-neutral-500 text-xs">
          {paymentDetails ? paymentDetails.paymentIntentId : "-"}
        </p>
        <p className="mt-0.5 text-neutral-500 text-sm">
          {paymentDetails && paymentDetails.status === "COMPLETED"
            ? paymentDetails.updatedAt.toDateString()
            : "-"}
        </p>
      </div>
    </div>
  );
}