import { redirect } from "next/navigation";
// Clerk
import { currentUser } from "@clerk/nextjs/server";
// db queries
import { getUserStores } from "@/actions/store";

export default async function SellerStoresPage() {
  const user = await currentUser()

  if (user) {
    const userStores = await getUserStores(user.id)
    if (userStores.length > 0) {
      redirect(`/dashboard/seller/stores/${userStores[0].url}`);
    } else {
      redirect("/dashboard/seller/stores/new");
    }
  }

  return (
    <div></div>
  )
}
