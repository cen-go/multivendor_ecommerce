// React & Next.js
import { useRouter } from "next/navigation";
import { useState } from "react";
// Types
import { CartProductType } from "@/lib/types";
// Utils
import { formatCurrency } from "@/lib/utils";
// Components
import toast from "react-hot-toast";
import { PulseLoader } from "react-spinners";
import { Button } from "../ui/button";
// Server actions and queries
import { saveUserCart } from "@/actions/user";

interface Props {
  cartItems: CartProductType[];
  totalShipping: number;
}

export default function CartSummary({ cartItems, totalShipping }: Props) {
  const router = useRouter();
  const [loading, setloading] = useState(false);
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const total = subtotal + totalShipping;

  async function handleSaveCart() {
    setloading(true);
    const res = await saveUserCart(cartItems);
    if (res.success) {
      router.push("/checkout");
      setloading(false)
    } else {
      toast.error(res.message);
      setloading(false);
    }
  }

  return (
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
          +{formatCurrency(totalShipping)}
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
      <div className="mt-2 font-bold flex items-center text-[#222] text-sm">
        <h2 className="overflow-hidden whitespace-nowrap text-ellipsis break-normal">
          Total
        </h2>
        <h3 className="flex-1 w-0 min-w-0 text-right px-0.5 text-black text-lg inline-block break-all">
          {formatCurrency(total)}
        </h3>
      </div>
      <div className="w-full">
        <div className="my-3 max-w-[400px] mx-auto">
          <Button onClick={handleSaveCart} disabled={loading}>
            {loading ? (
              <PulseLoader size={5} color="#fff" />
            ) : (
              <span>Checkout</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
