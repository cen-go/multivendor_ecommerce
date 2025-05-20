// Clerk
import { currentUser } from "@clerk/nextjs/server";
// Components
import Logo from "@/components/shared/logo";
import UserInfo from "./user-info";
import SidebarNavAdmin from "./side-nav-admin";
// Constants
import { adminDashboardSidebarOptions } from "@/lib/constants/dashboard-sidebar-options";

interface SidebarProps {
  isAdmin?: boolean;
}

export default async function Sidebar({isAdmin}: SidebarProps) {
  const user = await currentUser();
  return (
    <div className="w-[300px] border-r h-screen p-4 flex flex-col fixed top-0 left-0 bottom-0">
      <Logo width="210px" height="140px" sizes="33vw" priority={true} />
      <span className="mt-3" />
      {user && <UserInfo user={user} />}
      {isAdmin && <SidebarNavAdmin menuLinks={adminDashboardSidebarOptions} />}
    </div>
  )
}
