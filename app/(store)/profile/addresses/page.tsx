import { getUserShippingAddresses } from "@/actions/user"
import ProfileAddressesContainer from "@/components/store/profile/address-container";
import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";

export default async function UserAddressesPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const addresses = await getUserShippingAddresses(user.id);
  const countries = await db.country.findMany();

  return (
    <ProfileAddressesContainer addresses={addresses} countries={countries} />
  )
}
