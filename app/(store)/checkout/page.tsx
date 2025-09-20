// Next.js & React
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
// Server action & queries
import { getUserShippingAddresses } from "@/actions/user";
// Components
import CheckoutContainer from "@/components/store/checkout-page/checkout-container";
// Database client
import db from "@/lib/db";
// Types
import { UserCountry } from "@/lib/types";
// Clerk
import { currentUser } from "@clerk/nextjs/server";

export default async function CheckoutPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Get user cart
  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { cartItems: true },
  });

  if (!cart) redirect("/cart");

  // Get the user country from the cookies
  const cookieStore = await cookies();
  const countryCookie = cookieStore.get("userCountry");

  // Set a default country
  let userCountry: UserCountry = {
    name: "United States",
    code: "US",
  };

  // Update the user country if the cookie exists
  if (countryCookie) {
    userCountry = JSON.parse(countryCookie.value);
  }

  // Get user shipping addresses
  const addresses = await getUserShippingAddresses(user.id);

  // Get list of countries
  const countries = await db.country.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="bg-[#f4f4f4] min-h-[90vh]">
      <div className="max-w-[1200px] mx-auto py-4 px-2">
        <CheckoutContainer
          cart={cart}
          countries={countries}
          addresses={addresses}
          userCountry={userCountry}
        />
      </div>
    </div>
  );
}
