// React, Next.js
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
// Utils
import { formatCurrency } from "@/lib/utils";
// Types
import { Coupon, ShippingAddress, Store } from "@prisma/client";
import { CartWithCartItemsType } from "@/lib/types";
// Components
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import ApplyCouponForm from "../forms/apply-coupon";
import { PulseLoader } from "react-spinners";
// Server actions, queries
import { placeOrder } from "@/actions/user";
// Cart state
import { useCartStore } from "@/store/useCartStore";

interface Props {
  shippingFees: number;
  subtotal: number;
  total: number;
  discount: number;
  selectedAddress: ShippingAddress | undefined;
  cartId: string;
  setCart: Dispatch<SetStateAction<CartWithCartItemsType>>;
  coupon: Coupon & {store: Store} | null;
}

export default function PlaceOrderCard({
  cartId,
  shippingFees,
  subtotal,
  total,
  discount,
  selectedAddress,
  setCart,
  coupon,
}: Props) {
  const [loading, setLoading] = useState(false)
  const emptyCart = useCartStore((state) => state.emptyCart);
  const router = useRouter();

  async function handlePlaceOrder() {
    setLoading(true);
    if (!selectedAddress) {
      toast.error("Please select a shipping address!");
      setLoading(false)
      return;
    }
    const response = await placeOrder(selectedAddress, cartId);
    if (!response.success) {
      toast.error(response.message);
      setLoading(false);
    } else {
      emptyCart();
      toast.success(response.message);
      router.push(`/order/${response.orderId}`);
      setLoading(false);
    }
  }

  return (
    <div className="sticky top-4 lg:ml-5 lg:w-[380px] max-h-max">
      <div className="relative py-4 px-6 bg-white">
        <h1 className="text-gray-900 text-2xl font-bold mb-4">Summary</h1>
        {/* Subtotal */}
        <div className="mt-4 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
          <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            Subtotal
          </h2>
          <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
            {formatCurrency(subtotal)}
          </h3>
        </div>
        {/* Shipping Fees */}
        <div className="mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
          <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            Shipping Fees
          </h2>
          <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
            +{formatCurrency(shippingFees)}
          </h3>
        </div>
        {/* Taxes */}
        <div className="mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
          <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            Taxes
          </h2>
          <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
            +$0.00
          </h3>
        </div>
        {/* Coupon Discount */}
        {coupon && (
          <div className="mt-2 font-medium flex items-center text-[#222] text-sm pb-1 border-b">
            <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
              Coupon:&nbsp;<span className="text-green-600">{coupon.code}</span>
            </h2>
            <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-green-600 text-lg inline-block break-all">
              -{formatCurrency(discount)}
            </h3>
          </div>
        )}
        {/* Total */}
        <div className="mt-2 font-bold flex items-center text-[#222]">
          <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
            Total
          </h2>
          <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
            {formatCurrency(total)}
          </h3>
        </div>
        {/* Coupon form & Coupon tag */}
        <div className="mt-2">
          {coupon ? (
            <div className="flex mt-4 mb-8">
              <div className="w-4 bg-gradient-to-b from-orange-secondary to-orange-400"></div>
              <div className="px-6 py-3 border-t border-b border-r rounded-tr-4xl w-full">
                <h3 className="inline-block font-bold text-xl bg-gradient-to-r from-orange-secondary to-orange-400 text-transparent bg-clip-text">Coupon Applied</h3>
                <div>&quot;{coupon.code}&quot; %{coupon.discount} discount coupon applied to items from <b>{coupon.store.name} </b></div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white">
            <ApplyCouponForm cartId={cartId} setCart={setCart} />
          </div>
          )}
        </div>
        {/* Place Order Button */}
        <div className="w-full">
          <div className="my-3 max-w-[400px] mx-auto">
            <Button className="my-4" onClick={handlePlaceOrder}>
              {loading ? (
                <PulseLoader size={5} color="#fff" />
              ) : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
