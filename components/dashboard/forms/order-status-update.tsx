"use client"

import OrderStatusTag from "@/components/shared/order-status-tag";
import { OrderStatus } from "@prisma/client";
import { useState } from "react";

interface Props {
  storeId: string;
  orderGroupId: string;
  orderStatus: OrderStatus;
}

export default function OrderStatusUpdate({storeId, orderGroupId, orderStatus}: Props) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(orderStatus);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const options = Object.values(OrderStatus).filter(s => s !== newStatus);

  async function handleClick(selectedStatus:OrderStatus) {
    console.log(selectedStatus);
  }

  return (
    <div className="relative">
      {/* Current status */}
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <OrderStatusTag status={newStatus} />
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md shadow-md mt-2 w-[140px]">
          {options.map((option) => (
            <button
              key={option}
              className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => handleClick(option)}
            >
              <OrderStatusTag status={option} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
