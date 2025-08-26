import { CartProductType } from "@/lib/types"
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { CheckIcon, Trash2Icon } from "lucide-react";
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

  function handleSelectAll() {
    if (cartItems.length === selectedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems);
    }
  }

  function handleRemoveSelectedFromCart() {
    removeMultipleFromCart(selectedItems);
    setSelectedItems([]);
  }


  return (
    <div className="bg-white py-4">
      <h1 className="px-6 g-white text-[#222] font-bold text-2xl">
        Cart ({totalItems})
      </h1>
      <div className="flex items-center justify-start bg-white pt-4 px-6 w-full">
        <label
          onClick={handleSelectAll}
          className="p-0 text-gray-900 text-sm leading-6 list-none inline-flex items-center m-0 mr-2 cursor-pointer align-middle"
        >
          <span className="leading-8 inline-flex p-0.5 cursor-pointer">
            <span
              className={cn(
                "leading-8 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-orange-background",
                {
                  "border-orange-background":
                    cartItems.length === selectedItems.length,
                }
              )}
            >
              {cartItems.length === selectedItems.length && (
                <span className="bg-orange-background  w-5 h-5 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-3.5 text-white mt-0.5" />
                </span>
              )}
            </span>
          </span>
          <span className="leading-8 px-2 select-none">
            Select all products
          </span>
        </label>
        {selectedItems.length > 0 && (
          <div onClick={handleRemoveSelectedFromCart} className="flex gap-1.5 items-centerpl-4 border-l pl-3 pt-0.5 border-l-[#ebebeb] cursor-pointer text-destructive">
            <Trash2Icon className="w-5 pb-1.5 " />{" "}
            <span className="font-semibold text-sm leading-5">
              Delete selected products
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
