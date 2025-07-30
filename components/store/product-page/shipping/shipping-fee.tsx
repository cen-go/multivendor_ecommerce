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
      const totalFee =
        quantity === 1 || fee === extraFee
          ? fee * quantity
          : fee + extraFee * (quantity - 1);
      return (
        <div className="w-full pb-1">
          {/* Notes */}
          <div className="w-full">
            <span className="text-xs flex gap-1">
              <CheckIcon className="w-3.5 min-w-3.5 stroke-green-500" />
              <span className="mt-1">
                This store calculates the shipping fee based on the number of
                items in the order.
              </span>
            </span>
            {fee !== extraFee ? (
              <span className="text-xs flex gap-1">
                <CheckIcon className="w-3.5 min-w-3.5 stroke-green-500" />
                <span className="mt-1">
                  If you purchase multiple items, delivery fee will be{" "}
                  {formatCurrency(fee)} for the first item and{" "}
                  {formatCurrency(extraFee)} for each additional item.
                </span>
              </span>
            ) : (
              <span className="text-xs flex gap-1">
                <CheckIcon className="w-3.5 min-w-3.5 stroke-green-500" />
                <span className="mt-1">
                  If you purchase multiple items, delivery fee will be{" "}
                  {formatCurrency(fee)} for each ordered item.
                </span>
              </span>
            )}
          </div>
          <table className="w-full mt-1.5">
            <thead className="w-full">
              {fee === extraFee || extraFee === 0 ? (
                <tr
                  className="grid gap-x-1 text-xs px-4"
                  style={{ gridTemplateColumns: "4fr 1fr" }}
                >
                  <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                    Fee per item
                  </td>
                  <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                    {formatCurrency(fee)}
                  </td>
                </tr>
              ) : (
                <>
                  <tr
                    className="grid gap-x-1 text-xs px-4"
                    style={{ gridTemplateColumns: "4fr 1fr" }}
                  >
                    <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                      Fee for First Item
                    </td>
                    <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                      {formatCurrency(fee)}
                    </td>
                  </tr>

                  <tr
                    className="grid gap-x-1 text-xs px-4 mt-1"
                    style={{ gridTemplateColumns: "4fr 1fr" }}
                  >
                    <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                      Fee for Each Additional Item
                    </td>
                    <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm ">
                      {formatCurrency(extraFee)}
                    </td>
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              <tr
                className="grid gap-x-1 text-xs px-4 mt-1"
                style={{ gridTemplateColumns: "4fr 1fr" }}
              >
                <td className="w-full bg-gray-50 px-2 py-0.5 ">Quantity</td>
                <td className="w-full bg-gray-50 px-2 py-0.5 ">x{quantity}</td>
              </tr>
              <tr className="flex gap-x-1 text-xs px-4 mt-1 text-center font-semibold">
                <td className="w-full bg-gray-900 text-white px-1 py-1">
                  {quantity === 1 || fee === extraFee ? (
                    <span>
                      {formatCurrency(fee)} (fee) x {quantity} (items) =&nbsp;{formatCurrency(totalFee)}
                    </span>
                  ) : (
                    <span>
                      {formatCurrency(fee)} (first item) + {quantity - 1} (additional items) =&nbsp;
                      {formatCurrency(totalFee)}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case "WEIGHT":
      if (!weight) return null;
      const totalFeeWeight = fee * weight * quantity;
      return (
        <div className="w-full pb-1">
          {/* Notes */}
          <div className="w-full">
            <span className="text-xs flex gap-1">
              <CheckIcon className="w-3.5 min-w-3.5 stroke-green-500" />
              <span className="mt-1">
                This store calculates the delivery fee bases on product weight.
              </span>
            </span>
          </div>
          <table className="w-full mt-1.5">
            <thead className="w-full">
              <tr
                className="grid gap-x-1 text-xs px-4"
                style={{ gridTemplateColumns: "4fr 1fr" }}
              >
                <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                  Fee per kg (1kg = 2,205lbs)
                </td>
                <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                  {formatCurrency(fee)}
                </td>
              </tr>
            </thead>
            <tbody>
              <tr
                className="grid gap-x-1 text-xs px-4 mt-1"
                style={{ gridTemplateColumns: "4fr 1fr" }}
              >
                <td className="w-full bg-gray-50 px-2 py-0.5 ">Quantity</td>
                <td className="w-full bg-gray-50 px-2 py-0.5 ">x{quantity}</td>
              </tr>
               <tr
                className="grid gap-x-1 text-xs px-4 mt-1"
                style={{ gridTemplateColumns: "4fr 1fr" }}
              >
                <td className="w-full bg-gray-50 px-2 py-0.5 ">Weight</td>
                <td className="w-full bg-gray-50 px-2 py-0.5 ">{weight}kg</td>
              </tr>
              <tr className="flex gap-x-1 text-xs px-4 mt-1 text-center font-semibold">
                <td className="w-full bg-gray-900 text-white px-1 py-1">
                  <span>
                    {formatCurrency(fee)} (fee) x {weight}kg (weight) x {quantity} (items) =&nbsp;
                    {formatCurrency(totalFeeWeight)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case "FIXED":
      return (
        <div className="w-full pb-1">
          {/* Notes */}
          <div className="w-full">
            <span className="text-xs flex gap-x-1">
              <CheckIcon className="w-3.5 min-w-3.5 stroke-green-500" />
              <span className="mt-1">
                This store calculates the delivery fee on a fixed price.
              </span>
            </span>
          </div>
          <table className="w-full mt-1.5">
            <thead className="w-full">
              <tr
                className="grid gap-x-1 text-xs px-4"
                style={{ gridTemplateColumns: "4fr 1fr" }}
              >
                <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                  Fee
                </td>
                <td className="w-full bg-gray-50 px-2 py-0.5 rounded-sm">
                  {formatCurrency(fee)}
                </td>
              </tr>
            </thead>
            <tbody>
              <tr
                className="grid gap-x-1 text-xs px-4 mt-1"
                style={{ gridTemplateColumns: "4fr 1fr" }}
              >
                <td className="w-full bg-gray-50 px-2 py-0.5 ">Quantity</td>
                <td className="w-full bg-gray-50 px-2 py-0.5 ">x{quantity}</td>
              </tr>
              <tr className="flex gap-x-1 text-xs px-4 mt-1 text-center font-semibold">
                <td className="w-full bg-gray-900 text-white px-1 py-1">
                  <span>{formatCurrency(fee)} (quantity doesn&apos;t affect shipping fee.)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
      break;
    default:
      return null;
  }
}
