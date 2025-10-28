import { useState } from "react";

import { StoreStatus } from "@prisma/client"; // Type
import { updateStoreStatus } from "@/actions/store"; // Server action
import { toast } from "sonner";
import StoreStatusTag from "@/components/shared/store-status-tag";

interface Props {
  storeId: string;
  status: StoreStatus;
}

export default function StoreStatusUpdate({ status, storeId }: Props) {
  const [newStatus, setNewStatus] = useState<StoreStatus>(status);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Options
  const options = Object.values(StoreStatus).filter((s) => s !== newStatus);

  // Handle click
  const handleClick = async (selectedStatus: StoreStatus) => {
      const response = await updateStoreStatus(storeId, selectedStatus);
      if (response.success) {
        setNewStatus(response.status as StoreStatus);
        setIsOpen(false);
      } else {
        toast.error(response.message);
      }
  };
  return (
    <div className="relative">
      {/* Current status */}
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <StoreStatusTag status={newStatus} />
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md shadow-md mt-2 w-[140px]">
          {options.map((option) => (
            <button
              key={option}
              className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
              onClick={() => handleClick(option)}
            >
              <StoreStatusTag status={option} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};