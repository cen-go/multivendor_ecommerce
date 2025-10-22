"use client";

// Tanstack React Table
import { ColumnDef } from "@tanstack/react-table";

// Types
import { formatCurrency } from "@/lib/utils";
import { StoreOrderType } from "@/lib/types";
import PaymentStatusTag from "@/components/shared/payment-status-tag";
import OrderStatusUpdate from "@/components/dashboard/forms/order-status-update";

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
];
