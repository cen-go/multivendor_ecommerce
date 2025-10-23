"use client";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

import { StoreOrderType } from "@/lib/types"; // Types
import { formatCurrency } from "@/lib/utils"; // Utils
import { ExpandIcon } from "lucide-react"; // Icons
// Components
import PaymentStatusTag from "@/components/shared/payment-status-tag";
import OrderStatusUpdate from "@/components/dashboard/forms/order-status-update";
import { useModal } from "@/lib/modal-provider";
import CustomModal from "@/components/dashboard/shared/custom-modal";
import StoreOrderSummary from "@/components/dashboard/store-order-summary";

export const columns: ColumnDef<StoreOrderType>[] = [
  {
    accessorKey: "id",
    id: "id",
    header: "Order",
    cell: ({ row }) => {
      return <span>{row.original.id}</span>;
    },
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => {
      return <div>{row.original.orderItems.map(item => (
        <p key={item.id}>- {item.name} x ({item.quantity})</p>
      ))}</div>;
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      return <span><PaymentStatusTag status={row.original.order.paymentStatus} isTable /></span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <span>
          <OrderStatusUpdate
            orderGroupId={row.original.id}
            storeId={row.original.storeId}
            orderStatus={row.original.status}
          />
        </span>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      return (
        <span>
          {formatCurrency(row.original.total)}
        </span>
      );
    },
  },
  {
    accessorKey: "open",
    header: "",
    cell: ({ row }) => {
      return <ViewOrderButton group={row.original} />;
    },
  },
];

interface ViewOrderButtonProps {
  group: StoreOrderType;
}

function ViewOrderButton({ group }: ViewOrderButtonProps) {
  const { setOpen } = useModal();

  return (
    <button
      className="font-sans cursor-pointer flex justify-center gap-2 items-center mx-auto text-lg text-gray-50 bg-[#0A0D2D] backdrop-blur-md lg:font-semibold isolation-auto before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-blue-primary hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
      onClick={() => {
        setOpen(
          <CustomModal maxWidth="!max-w-3xl">
            <StoreOrderSummary group={group} />
          </CustomModal>
        );
      }}
    >
      View
      <span className="w-7 h-7 rounded-full bg-white grid place-items-center">
        <ExpandIcon className="w-5 stroke-black" />
      </span>
    </button>
  );
};
