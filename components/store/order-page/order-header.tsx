"use client";
import OrderStatusTag from "@/components/shared/order-status-tag";
import PaymentStatusTag from "@/components/shared/payment-status-tag";
import { OrderExtendedType } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export default function OrderHeader({ order }: { order: OrderExtendedType }) {
  if (!order) return;

  return (
    <div>
      <div className="w-full border-b flex flex-col min-[1100px]:flex-row gap-4 p-2">
        {/* Order id */}
        <div className="min-[1100px]:w-[920px] xl:w-[990px] flex items-center gap-x-3 ">
          <div className="border-r pr-4">
            <button className="w-10 h-10 border rounded-full grid place-items-center">
              <ChevronLeft className="stroke-main-secondary" />
            </button>
          </div>
          <h1 className="text-main-secondary">Order Details</h1>
          <ChevronRight className="stroke-main-secondary w-4" />
          <h2>Order #{order.id}</h2>
        </div>
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 ">
          {/* Status */}
          <div className="w-full flex items-center gap-x-4">
            <PaymentStatusTag status={order.paymentStatus} />
            <OrderStatusTag status={order.orderStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}