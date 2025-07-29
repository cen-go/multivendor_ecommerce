import { formatCurrency } from "@/lib/utils";
import { ShippingFeeMethod } from "@prisma/client"
import { CheckIcon } from "lucide-react";

interface Props {
  method: ShippingFeeMethod;
  fee: number;
  extraFee: number;
  weight: number | null;
  quantity: number;
}

export default function ProductShippingFee({method, fee, extraFee, weight, quantity}: Props) {
  switch (method) {
    case "ITEM":
      return (
        <div className="w-full pb-1">
          {/* Notes */}
          <div className="w-full">
            <span className="text-xs flex gap-1">
              <CheckIcon className="w-3" />
              <span className="mt-1">
                This store calculates the shipping fee based on the number of
                items in the order.
              </span>
            </span>
            {fee !== extraFee ? (
              <span className="text-xs flex gap-1">
                <CheckIcon className="w-3" />
                <span className="mt-1">
                  If you purchase multiple items, delivery fee will be{" "}
                  {formatCurrency(fee)} for the first item and{" "}
                  {formatCurrency(extraFee)} for each additional item.
                </span>
              </span>
            ) : (
              <span className="text-xs flex gap-1">
                <CheckIcon className="w-3" />
                <span className="mt-1">
                  If you purchase multiple items, delivery fee will be{" "}
                  {formatCurrency(fee)} for each ordered item.
                </span>
              </span>
            )}
          </div>
        </div>
      );
      break;
    case "WEIGHT":
      
      break;
    case "FIXED":
      
      break;
    default:
      return null;
  }
}
