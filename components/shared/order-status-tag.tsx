import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { TruckIcon } from "lucide-react";

interface OrderStatusTagProps {
  status: OrderStatus;
}

const statusStyles: {
  [key in OrderStatus]: { bgColor: string; textColor: string; label: string };
} = {
  [OrderStatus.PENDING]: {
    bgColor: "bg-yellow-100 dark:bg-yellow-500/10",
    textColor: "text-yellow-800 dark:text-yellow-500",
    label: "Pending",
  },
  [OrderStatus.CONFIRMED]: {
    bgColor: "bg-blue-100 dark:bg-blue-500/10",
    textColor: "text-blue-800 dark:text-blue-500",
    label: "Confirmed",
  },
  [OrderStatus.PROCESSING]: {
    bgColor: "bg-indigo-100 dark:bg-indigo-500/10",
    textColor: "text-indigo-800 dark:text-indigo-500",
    label: "Processing",
  },
  [OrderStatus.SHIPPED]: {
    bgColor: "bg-teal-100 dark:bg-teal-500/10",
    textColor: "text-teal-800 dark:text-teal-500",
    label: "Shipped",
  },
  [OrderStatus.ON_DELIVERY]: {
    bgColor: "bg-orange-100 dark:bg-orange-500/10",
    textColor: "text-orange-800 dark:text-orange-500",
    label: "Out for Delivery",
  },
  [OrderStatus.DELIVERED]: {
    bgColor: "bg-green-100 dark:bg-green-500/10",
    textColor: "text-green-800 dark:text-green-500",
    label: "Delivered",
  },
  [OrderStatus.CANCELLED]: {
    bgColor: "bg-red-100 dark:bg-red-500/10",
    textColor: "text-red-800 dark:text-red-500",
    label: "Cancelled",
  },
  [OrderStatus.FAILED]: {
    bgColor: "bg-gray-100 dark:bg-gray-500/10",
    textColor: "text-gray-800 dark:text-gray-500",
    label: "Failed",
  },
  [OrderStatus.REFUNDED]: {
    bgColor: "bg-purple-100 dark:bg-purple-500/10",
    textColor: "text-purple-800 dark:text-purple-500",
    label: "Refunded",
  },
  [OrderStatus.RETURNED]: {
    bgColor: "bg-pink-100 dark:bg-pink-500/10",
    textColor: "text-pink-800 dark:text-pink-500",
    label: "Returned",
  },
  [OrderStatus.PARTIALLY_SHIPPED]: {
    bgColor: "bg-cyan-100 dark:bg-cyan-500/10",
    textColor: "text-cyan-800 dark:text-cyan-500",
    label: "Partially Shipped",
  },
  [OrderStatus.ON_HOLD]: {
    bgColor: "bg-violet-100 dark:bg-violet-500/10",
    textColor: "text-violet-800 dark:text-violet-500",
    label: "On Hold",
  },
};

export default function OrderStatusTag({status}: OrderStatusTagProps) {
  const styles = statusStyles[status];
  const { bgColor, textColor, label } = styles;
  return (
    <div>
      <span
        className={cn(
          "py-1 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-md",
          bgColor,
          textColor
        )}
      >
        <TruckIcon className="shrin- size-3" />
        {label}
      </span>
    </div>
  );
};