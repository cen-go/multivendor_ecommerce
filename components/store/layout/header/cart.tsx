import Link from "next/link";
import { CartIcon } from "@/components/store/icons";

export default function Cart() {
  // Get total items in the cart
  const totalItems = 2;
  return (
    <div className="relative flex h-11 items-center px-2 cursor-pointer">
      <Link href="/cart" className="flex items-center text-white">
        <span className="text-[32px] inline-block">
          <CartIcon />
        </span>

        <div className="min-h-3 min-w-6 -mt-5 -ml-3">
          <span className="inline-block text-xs text-main-primary bg-white leading-4 text-center rounded-lg font-bold min-h-3 px-1 win-w-10">
            {totalItems}
          </span>
        </div>

        <b className="text-sm text-wrap">Cart</b>
      </Link>
    </div>
  );
}
