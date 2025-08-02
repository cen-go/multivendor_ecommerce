"use client";

// React Next.js
import { useEffect, useState } from "react";
// Types
import { ShippingFeeMethod } from "@prisma/client";
import { ProductShippingDetailsType } from "@/lib/types";
// Utils
import { calculateShippingDateRange, formatCurrency } from "@/lib/utils";
// Icons
import { ChevronDown, ChevronRight, ChevronUp, TruckIcon } from "lucide-react";
// Components
import ProductShippingFee from "./shipping-fee";

interface Props {
  shippingDetails: ProductShippingDetailsType;
  quantity: number;
  weight: number | null;
}
export default function ShippingDetails({
  shippingDetails,
  quantity,
  weight,
}: Props) {
  const {
    countryName,
    deliveryTimeMax,
    deliveryTimeMin,
    shippingFee,
    extraShippingFee,
    shippingFeeMethod,
    freeShipping,
  } = shippingDetails;

  const [shippingTotal, setShippingTotal] = useState<number>(0);
  const [showTable, setShowTable] = useState<boolean>(false);

  useEffect(() => {
    switch (shippingFeeMethod) {
      case ShippingFeeMethod.ITEM:
        setShippingTotal(shippingFee + (quantity - 1) * extraShippingFee);
        break;
      case ShippingFeeMethod.WEIGHT:
        if (!weight) {
          setShippingTotal(0);
        } else {
          setShippingTotal(weight * shippingFee);
        }
        break;
      case ShippingFeeMethod.FIXED:
        setShippingTotal(shippingFee);
        break;
      default:
        break;
    }
  }, [
    quantity,
    extraShippingFee,
    shippingFee,
    shippingFeeMethod,
    weight,
    countryName,
  ]);

  const shippingDateRange = calculateShippingDateRange(
    deliveryTimeMin,
    deliveryTimeMax
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          <TruckIcon className="w-4 pb-0.5" />
          <span className="text-sm font-bold">
            {freeShipping ? (
              <p>Free shipping to&nbsp;{countryName}</p>
            ) : (
              <p>
                Shipping to&nbsp;{countryName}&nbsp;for&nbsp;
                {formatCurrency(shippingTotal)}
              </p>
            )}
          </span>
        </div>
        <ChevronRight className="w-4" />
      </div>
      <div className="flex items-center text-sm ml-5">
        Delivery:&nbsp;
        <span className="font-semibold">
          {shippingDateRange.minDate} - {shippingDateRange.maxDate}
        </span>
      </div>
      {/* Product shipping fee */}
      {!freeShipping && showTable && (
        <ProductShippingFee
          method={shippingFeeMethod}
          fee={shippingFee}
          extraFee={extraShippingFee}
          weight={weight}
          quantity={quantity}
        />
      )}
      {!showTable && !freeShipping && (
        <div
          className="text-center text-xs cursor-pointer text-main-secondary hover:underline"
          onClick={() => setShowTable(true)}
        >
          Show details <ChevronDown className="inline-block w-3.5" />
        </div>
      )}
      {showTable && !freeShipping && (
        <div
          className="text-center text-xs cursor-pointer text-main-secondary hover:underline"
          onClick={() => setShowTable(false)}
        >
          Hide details <ChevronUp className="inline-block w-3.5" />
        </div>
      )}
    </div>
  );
}
