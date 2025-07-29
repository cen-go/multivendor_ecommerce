"use client";

import { ProductShippingDetailsType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ShippingFeeMethod } from "@prisma/client";
import { ChevronRight, TruckIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
    returnPolicy,
    shippingService,
    shippingFee,
    extraShippingFee,
    shippingFeeMethod,
    freeShipping,
  } = shippingDetails;

  const [shippingTotal, setShippingTotal] = useState<number>(0);

  useEffect(() => {
    switch (shippingFeeMethod) {
      case ShippingFeeMethod.ITEM:
        setShippingTotal(shippingFee + (quantity - 1) * extraShippingFee);
        break;
      case ShippingFeeMethod.WEIGHT:
        if (!weight) {
          setShippingTotal(0)
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
  }, [quantity, extraShippingFee, shippingFee, shippingFeeMethod, weight]);

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
      {/* Product shipping fee */}
      {!freeShipping && (
        <ProductShippingFee
        method={shippingFeeMethod}
        fee={shippingFee}
        extraFee={extraShippingFee}
        weight={weight}
        quantity={3}
      />
      )}
    </div>
  );
}
