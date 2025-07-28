"use client";

import { ProductShippingDetailsType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ShippingFeeMethod } from "@prisma/client";
import { TruckIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
          <TruckIcon className="w-4" />
          <span className="text-sm font-bold flex items-center">
            <p>
              Shipping to&nbsp;<span>{countryName}</span>
            </p>
            <span>&nbsp;{formatCurrency(shippingTotal)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
