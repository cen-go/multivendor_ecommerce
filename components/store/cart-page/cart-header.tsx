import { CartProductType } from "@/lib/types"
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { CheckIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  cartItems: CartProductType[];
  selectedItems: CartProductType[];
  setSelectedItems: Dispatch<SetStateAction<CartProductType[]>>;
  totalItems: number;
}
export default function CartHeader({
  cartItems,
  selectedItems,
  setSelectedItems,
  totalItems,
}: Props) {
  const removeMultipleFromCart = useCartStore(state => state.removeMultipleFromCart);

  return (
    <div className="bg-white py-4">
      <div className="px-6 g-white text-[#222] font-bold text-2xl">
        <h1>Cart ({totalItems})</h1>
      </div>
      <div className="flex justify-between bg-white pt-4 px-6">
        <div className="flex items-center justify-start w-full">
          <label className="p-0 text-gray-900 text-sm leading-6 list-none inline-flex items-center m-0 mr-2 cursor-pointer align-middle">
            <span className="leading-8 inline-flex p-0.5 cursor-pointer">
              <span className={cn("leading-8 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-orange-background", {
                "border-orange-background": cartItems.length === selectedItems.length
              })}>
                {cartItems.length === selectedItems.length && (
                    <span className="bg-orange-background  w-5 h-5 rounded-full flex items-center justify-center">
                      <CheckIcon className="w-3.5 text-white mt-0.5" />
                    </span>
                  )}
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
