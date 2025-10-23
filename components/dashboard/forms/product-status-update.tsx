import { useState } from "react";

import { ProductStatus } from "@prisma/client"; // Type
import { updateOrderItemStatus } from "@/actions/order"; // Server action
import ProductStatusTag from "@/components/shared/product-status-tag";
import { toast } from "sonner";

interface Props {
  storeId: string;
  orderItemId: string;
  status: ProductStatus;
}

export default function ProductStatusUpdate({ orderItemId, status, storeId }: Props) {
  const [newStatus, setNewStatus] = useState<ProductStatus>(status);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Options
  const options = Object.values(ProductStatus).filter((s) => s !== newStatus);

  // Handle click
  const handleClick = async (selectedStatus: ProductStatus) => {
    const response = await updateOrderItemStatus(storeId, orderItemId, selectedStatus)
        if (response.success) {
          toast.success(response.message);
          setNewStatus(response.status ?? selectedStatus);
          setIsOpen(false);
        } else {
          toast.error(response.message);
          setIsOpen(false);
        }
  };
  return (
    <div className="relative">
      {/* Current status */}
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ProductStatusTag status={newStatus} />
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md shadow-md mt-2 w-[170px]">
          {options.map((option) => (
            <button
              key={option}
              className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => handleClick(option)}
            >
              <ProductStatusTag status={option} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};