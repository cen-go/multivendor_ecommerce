"use client";

import OrderStatusTag from "@/components/shared/order-status-tag";
import { OrderGroupWithItemsType } from "@/lib/types";
import Image from "next/image";
import React from "react";
import ProductRow from "./product-row";
import ProductRowGrid from "./product-row-grid";
import { useMediaQuery } from "react-responsive";
import { cn, formatCurrency } from "@/lib/utils";

export default function OrderGroupTable({
  group,
  deliveryInfo,
  check,
}: {
  group: OrderGroupWithItemsType;
  deliveryInfo: {
    shippingService: string;
    deliveryMinDate: string;
    deliveryMaxDate: string;
  };
  check: boolean;
}) {
  const { shippingService, deliveryMaxDate, deliveryMinDate } = deliveryInfo;
  const { coupon, couponId, subtotal, total, shippingFees } = group;
  let discountedAmount = 0;
  if (couponId && coupon) {
    discountedAmount = Math.round((subtotal * coupon.discount) / 100);
  }
  const isBigScreen = useMediaQuery({ query: "(min-width: 1400px)" });

  return (
    <div className="border border-gray-200 rounded-xl pt-6  max-lg:mx-auto lg:max-w-full">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between px-6 pb-6 border-b border-gray-200">
        <div>
          <p className="font-semibold text-base leading-7 text-black">
            Order Id:
            <span className="text-blue-primary font-medium ms-2">
              #{group.id}
            </span>
          </p>
          <div className="flex items-center gap-x-2 mt-4">
            <Image
              src={group.store.logo}
              alt={group.store.name}
              width={100}
              height={100}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-main-secondary font-medium">
              {group.store.name}
            </span>
            <div className="w-[1px] h-5 bg-border mx-2" />
            <p>{shippingService}</p>
            <div className="w-[1px] h-5 bg-border mx-2" />
          </div>
        </div>
        <div className="mt-4 xl:mt-10">
          <OrderStatusTag status={group.status} />
        </div>
      </div>
      <div className="w-full px-3 min-[400px]:px-6 ">
        <div>
          {group.orderItems.map((product) => (
            <div key={product.id}>
              {isBigScreen ? (
                <ProductRowGrid product={product} />
              ) : (
                <ProductRow product={product} />
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row justify-between">
          {/* Delivery dates */}
          <div className="flex items-center max-lg:mt-3 text-center">
            <div className="flex flex-col p-2 pb-4">
              <p className="font-medium text-sm whitespace-nowrap leading-6 text-black">
                Expected Delivery Time
              </p>
              <p className="font-medium text-base whitespace-nowrap leading-7 lg:mt-3 text-emerald-500">
                {deliveryMinDate} - {deliveryMaxDate}
              </p>
            </div>
          </div>
          {/* subtotal - shipping fee - coupon */}
          <div className="flex flex-col items-center lg:items-end">
            <p className="font-medium text-sm text-gray-900 py-2 max-lg:text-center">
              Subtotal:
              <span className="text-gray-500 ms-1">
                {formatCurrency(subtotal)}
              </span>
            </p>
            <p className="font-medium text-sm text-gray-900 py-2 max-lg:text-center">
              Shipping Fees:
              <span className="text-gray-500 ms-1">
                {formatCurrency(shippingFees)}
              </span>
            </p>
            {group.couponId && (
              <p className="font-medium text-sm text-gray-900 py-2 max-lg:text-center">
                Coupon ({coupon?.code})
                <span className="text-gray-500 ms-1">
                  (-{coupon?.discount}%)
                </span>
                <span className="text-gray-500 ms-1">
                  (-{formatCurrency(discountedAmount)})
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Group info */}
      <div
        className={cn(
          "w-full border-t border-gray-200 px-6 flex flex-col 2xl:flex-row items-center justify-between",
          {
            "xl:flex-row": check,
          }
        )}
      >
        <div
          className={cn(
            "flex flex-col 2xl:flex-row items-center max-lg:border-b border-gray-200",
            {
              "lg:flex-row": check,
            }
          )}
        >
          <button className="flex outline-0 py-6 sm:pr-6 sm:borde-r border-gray-200 whitespace-nowrap gap-2 items-center justify-center font-semibold group text-black bg-white transition-all duration-500 hover:text-destructive cursor-pointer">
            <svg
              className="stroke-black transition-all duration-500 group-hover:stroke-destructive"
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M5.5 5.5L16.5 16.5M16.5 5.5L5.5 16.5"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            Cancel Order
          </button>
        </div>
        <div>
          <p className="font-semibold text-xl text-black py-4">
            Total price:
            <span className="text-blue-primary ms-1">
              {formatCurrency(total)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}