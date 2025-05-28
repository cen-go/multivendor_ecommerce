import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/sidebar/sidebar";
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

  return (
      <div className="w-full h-full">
        <Sidebar />
        <div className="ml-0 md:ml-[300px]">
          <Header />
          <div className="w-full mt-[75px] p-4">
            <main>
              {children}
            </main>
          </div>
        </div>
      </div>
    )
}