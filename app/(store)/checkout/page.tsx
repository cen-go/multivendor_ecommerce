import { getUserShippingAddresses } from "@/actions/user";
import CheckoutContainer from "@/components/store/checkout-page/checkout-container";
import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Get user cart
  const cart = await db.cart.findUnique({
    where: {userId: user.id},
    include: {cartItems: true},
  });

  if (!cart) redirect("/cart");

  // Get user shipping addresses
  const addresses = await getUserShippingAddresses(user.id)

  // Get list of countries
  const countries = await db.country.findMany({
    orderBy: {name: "asc"}
  });

  return (
    <div className="bg-[#f4f4f4] min-h-[90vh]">
      <div className="max-w-[1200px] mx-auto py-4 px-2">
        <CheckoutContainer cart={cart} countries={countries} addresses={addresses} />
      </div>
    </div>
  )
}
