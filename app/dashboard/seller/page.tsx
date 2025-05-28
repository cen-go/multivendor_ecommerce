import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server"
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function SellerDashboardPage() {
  const user = await currentUser();
  if (!user || user?.privateMetadata?.role !== Role.SELLER) {
    redirect("/");
  }

  // Retreive the list of stores associated with the authenticated user
  const userStores = await db.store.findMany({ where: { userId: user.id } });

  // if the user has no stores redirect them to the page for creating a new store
  if (userStores.length === 0) redirect("/dashboard/seller/stores/new");

  redirect(`/dashboard/seller/stores/${userStores[0].url}`);

  return (
    <div>Seller Dashboard</div>
  )
}
