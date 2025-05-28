import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function SellerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();

  if (!user || user.privateMetadata?.role !== Role.SELLER) {
    redirect("/");
  }

  return <div>{children}</div>;
}