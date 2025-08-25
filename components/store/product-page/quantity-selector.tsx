// React Next.js
import { useEffect } from "react";
// Types
import { CartProductType } from "@/lib/types";
// Icons
import { MinusIcon, PlusIcon } from "lucide-react";

interface Props {
  sizeId: string;
  quantity: number;
  stock: number;
  maxQuantity: number;
  handleChange: (
    property: keyof CartProductType,
    value: number | string | boolean | undefined
  ) => void;
}

export default function QuantitySelector({
  sizeId,
  quantity,
  handleChange,
  stock,
  maxQuantity,
}: Props) {
  // UseEffect to reset the quantity back to 1 when the selected size changes
  useEffect(() => {
    handleChange("quantity", 1);
  }, [sizeId, handleChange]);

  //functions to handle quantity change
  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      handleChange("quantity", quantity + 1);
    }
  };
  const handleDecrease = () => {
    if (quantity > 1) {
      handleChange("quantity", quantity - 1);
    }
  };

  return (
    <div>
      <div className="w-full py-1 px-3 bg-white border rounded-lg">
        <div className="w-full flex justify-between items-center gap-x-5">
          <div className="grow">
            <label htmlFor="quantity" className="text-xs text-main-secondary">
              Select quantity
            </label>
            <input
              type="number"
              id="quantity"
              min={1}
              value={quantity}
              max={maxQuantity}
              disabled={maxQuantity <= 0}
              onChange={() => quantity}
              readOnly
              className="w-full bg-transparent border-0 focus:outline-0 text-gray-800"
            />
          </div>
          <div className="flex justify-end items-center gap-x-1.5">
            <button
              className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              onClick={handleDecrease}
              disabled={quantity === 1}
              aria-label="decrease quantity"
            >
              <MinusIcon className="w-3" />
            </button>
            <button
              className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white shadow-sm focus:outline-none focus:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              onClick={handleIncrease}
              disabled={quantity === maxQuantity || maxQuantity <= 0}
              aria-label="increase quantity"
            >
              <PlusIcon className="w-3" />
            </button>
          </div>
        </div>
      </div>
      {maxQuantity !== stock && (
        <p className="text-xs text-main-secondary mt-0.5">
          * You alread have {stock - maxQuantity} pieces of this product in your
          cart.
        </p>
      )}
    </div>
  );
}
