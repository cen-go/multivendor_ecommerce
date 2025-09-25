import { ProductStatus } from "@prisma/client";
import { Package } from "lucide-react"; // Lucide package icon

interface ProductStatusTagProps {
  status: ProductStatus;
}

const productStatusStyles: {
  [key in ProductStatus]: { bgColor: string; textColor: string; label: string };
} = {
  [ProductStatus.PENDING]: {
    bgColor: "bg-gray-100 dark:bg-gray-500/10",
    textColor: "text-gray-800 dark:text-gray-500",
    label: "Pending",
  },
  [ProductStatus.PROCESSING]: {
    bgColor: "bg-yellow-100 dark:bg-yellow-500/10",
    textColor: "text-yellow-800 dark:text-yellow-500",
    label: "Processing",
  },
  [ProductStatus.READY_FOR_SHIPMENT]: {
    bgColor: "bg-blue-100 dark:bg-blue-500/10",
    textColor: "text-blue-800 dark:text-blue-500",
    label: "Ready for Shipment",
  },
  [ProductStatus.SHIPPED]: {
    bgColor: "bg-teal-100 dark:bg-teal-500/10",
    textColor: "text-teal-800 dark:text-teal-500",
    label: "Shipped",
  },
  [ProductStatus.DELIVERED]: {
    bgColor: "bg-green-100 dark:bg-green-500/10",
    textColor: "text-green-800 dark:text-green-500",
    label: "Delivered",
  },
  [ProductStatus.CANCELLED]: {
    bgColor: "bg-red-100 dark:bg-red-500/10",
    textColor: "text-red-800 dark:text-red-500",
    label: "Canceled",
  },
  [ProductStatus.RETURNED]: {
    bgColor: "bg-pink-100 dark:bg-pink-500/10",
    textColor: "text-pink-800 dark:text-pink-500",
    label: "Returned",
  },
  [ProductStatus.REFUNDED]: {
    bgColor: "bg-purple-100 dark:bg-purple-500/10",
    textColor: "text-purple-800 dark:text-purple-500",
    label: "Refunded",
  },
  [ProductStatus.FAILED_DELIVERY]: {
    bgColor: "bg-orange-100 dark:bg-orange-500/10",
    textColor: "text-orange-800 dark:text-orange-500",
    label: "Failed Delivery",
  },
  [ProductStatus.ON_HOLD]: {
    bgColor: "bg-indigo-100 dark:bg-indigo-500/10",
    textColor: "text-indigo-800 dark:text-indigo-500",
    label: "On Hold",
  },
  [ProductStatus.BACK_ORDERED]: {
    bgColor: "bg-cyan-100 dark:bg-cyan-500/10",
    textColor: "text-cyan-800 dark:text-cyan-500",
    label: "Backordered",
  },
  [ProductStatus.PARTIALLY_SHIPPED]: {
    bgColor: "bg-lime-100 dark:bg-lime-500/10",
    textColor: "text-lime-800 dark:text-lime-500",
    label: "Partially Shipped",
  },
  [ProductStatus.EXCHANGE_REQUESTED]: {
    bgColor: "bg-rose-100 dark:bg-rose-500/10",
    textColor: "text-rose-800 dark:text-rose-500",
    label: "Exchange Requested",
  },
  [ProductStatus.AWAITING_PICKUP]: {
    bgColor: "bg-violet-100 dark:bg-violet-500/10",
    textColor: "text-violet-800 dark:text-violet-500",
    label: "Awaiting Pickup",
  },
};

const ProductStatusTag: React.FC<ProductStatusTagProps> = ({ status }) => {
  const styles = productStatusStyles[status];

  return (
    <div>
      <span
        className={`py-1 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-md ${styles.bgColor} ${styles.textColor}`}
      >
        <Package className="shrink-0 size-3" /> {/* Lucide Package Icon */}
        {styles.label}
      </span>
    </div>
  );
};

export default ProductStatusTag;