import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import Header from "@/components/dashboard/header/header";
import Sidebar from "@/components/dashboard/sidebar/sidebar";

export default async function AdminDashboardLayout({children}: {children: ReactNode}) {
  // Block non-admins from accessing
  const user = await currentUser();
  if (!user ||  user?.privateMetadata.role !== "ADMIN") redirect("/");

  return (
    <div className="w-full h-full">
      <Sidebar isAdmin/>
      <div className="ml-0 lg:ml-[300px]">
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
