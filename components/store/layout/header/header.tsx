// React Next.js
import Link from "next/link";
// Constants
import { APP_NAME } from "@/lib/constants";
// Components
import UserMenu from "./userMenu/user-menu";

export default function StoreHeader() {
  return (
    <header className="bg-gradient-to-r from-slate-500 to-slate-800">
      <div className="h-full w-full lg:flex text-white px-4 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:flex-1 lg:w-full gap-3 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="font-extrabold text-3xl font-mono">{APP_NAME}</h1>
            </Link>
            <div className="flex lg:hidden">
              <UserMenu />
              <div className="w-12"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
