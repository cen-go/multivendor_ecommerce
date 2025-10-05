import ProfileSidebar from "@/components/store/profile/profile-sidebar";
import { ReactNode } from "react";

export default function ProfileLayout({children}: {children: ReactNode}) {
  return (
    <div className="bg-[#f5f5f5] min-h-[calc(100vh-270px)]">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-4 p-2 pb-12">
        {/* sidebar */}
        <ProfileSidebar />
        <div className="w-full flex-1 lg:mt-12">{children}</div>
      </div>
    </div>
  )
}
