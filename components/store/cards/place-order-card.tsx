// React, Next.js
import { useRouter } from "next/navigation";
// Utils
import { formatCurrency } from "@/lib/utils";
// Types
import { ShippingAddress } from "@prisma/client";
// Components
import { Button } from "../ui/button";
import toast from "react-hot-toast";
// Server actions, queries
import { placeOrder } from "@/actions/user";
// Cart state
import { useCartStore } from "@/store/useCartStore";
import ApplyCouponForm from "../forms/apply-coupon";
import { Dispatch, SetStateAction } from "react";
import { CartWithCartItemsType } from "@/lib/types";

interface Props {
  shippingFees: number;
  subtotal: number;
  total: number;
  selectedAddress: ShippingAddress | undefined;
  cartId: string;
  setCart: Dispatch<SetStateAction<CartWithCartItemsType>>;
}

export default function PlaceOrderCard({
  cartId,
  shippingFees,
  subtotal,
  total,
  selectedAddress,
  setCart,
}: Props) {
  const emptyCart = useCartStore((state) => state.emptyCart);
  const router = useRouter();

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast.error("Please select a shipping address!");
      return;
    }
    const response = await placeOrder(selectedAddress, cartId);
    if (!response.success) {
      toast.error(response.message);
    } else {
      emptyCart();
      toast.success(response.message);
      router.push(`/order/${response.orderId}`);
    }
  }

  return (
    <div className="sticky top-4 lg:ml-5 lg:w-[380px] max-h-max">
      <div className="relative py-4 px-6 bg-white">
        <h1 className="text-gray-900 text-2xl font-bold mb-4">Summary</h1>
        <div className="mt-4 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
          <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            Subtotal
          </h2>
          <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
            {formatCurrency(subtotal)}
          </h3>
        </div>
        <div className="mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
          <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            Shipping Fees
          </h2>
          <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
            +{formatCurrency(shippingFees)}
          </h3>
        </div>
        <div className="mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
          <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            Taxes
          </h2>
          <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
            +$0.00
          </h3>
        </div>
        <div className="mt-2 font-bold flex items-center text-[#222]">
          <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            Total
          </h2>
          <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
            {formatCurrency(total)}
          </h3>
        </div>
        <div className="mt-2">
          <div className="p-4 bg-white">
            <ApplyCouponForm cartId={cartId} setCart={setCart} />
          </div>
        </div>
        <div className="w-full">
          <div className="my-3 max-w-[400px] mx-auto">
            <Button className="my-4" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
