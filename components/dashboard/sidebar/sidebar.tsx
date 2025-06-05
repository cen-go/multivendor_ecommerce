// Clerk
import { currentUser } from "@clerk/nextjs/server";
// Components
import Logo from "@/components/shared/logo";
import UserInfo from "./user-info";
import SidebarNavAdmin from "./side-nav-admin";
// Constants
import { adminDashboardSidebarOptions, SellerDashboardSidebarOptions } from "@/lib/constants/dashboard-sidebar-options";
// Types
import { Store } from "@prisma/client";
import SidebarNavSeller from "./side-nav-seller";
import StoreSwitcher from "./store-switcher";

interface SidebarProps {
  isAdmin?: boolean;
  stores?: Store[];
}

export default async function Sidebar({isAdmin, stores}: SidebarProps) {
  const user = await currentUser();
  return (
    <div className="w-[300px] border-r h-screen p-4 hidden md:flex flex-col fixed top-0 left-0 bottom-0">
      <Logo width="210px" height="140px" sizes="33vw" priority={true} />
      <span className="mt-3" />
      {user && <UserInfo user={user} />}
      {!isAdmin && stores && <StoreSwitcher stores={stores} className="mb-6 mt-2" />}
      {isAdmin ? (
        <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />
      ) : (
        <SidebarNavSeller menuLinks={SellerDashboardSidebarOptions} />
      )}
    </div>
  );
}
