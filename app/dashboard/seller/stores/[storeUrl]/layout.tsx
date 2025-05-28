// React, Next.js
import { redirect } from "next/navigation";
import { ReactNode } from "react";
// Clerk
import { currentUser } from "@clerk/nextjs/server";
// Prisma enum for user role
import { Role } from "@prisma/client";
// Custom UI components
import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/sidebar/sidebar";

export default async function SellerStoreDashboardLayout({
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