import { CartProductType } from "@/lib/types";
import { Size } from "@prisma/client";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useEffect } from "react";

interface Props {
  productId: string;
  variantId: string;
  sizeId: string;
  quantity: number;
  sizes: Size[];
  stock: number;
  handleChange: (
    property: keyof CartProductType,
    value: number | string | boolean | undefined
  ) => void;
}

export default function QuantitySelector({
  productId,
  variantId,
  sizeId,
  quantity,
  handleChange,
  stock,
}: Props) {
  // UseEffect to reset the quantity back to 1 when the selected size changes
  useEffect(() => {
    handleChange("quantity", 1);
  }, [sizeId]);

  //functions to handle quantity change
  const handleIncrease = () => {
    if (quantity < stock) {
      handleChange("quantity", quantity + 1);
    }
  };
  const handleDecrease = () => {
    if (quantity > 1) {
      handleChange("quantity", quantity - 1);
    }
  };

  return (
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
            disabled={quantity === stock}
            aria-label="increase quantity"
          >
            <PlusIcon className="w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
