import CartContainer from "@/components/store/cart-page/container";
import { UserCountry } from "@/lib/types";
import { cookies } from "next/headers";

export default async function CartPage() {
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

  return <CartContainer userCountry={userCountry} />;
}
