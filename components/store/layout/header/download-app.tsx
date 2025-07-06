import Link from "next/link";
import Image from "next/image";
import { AppIcon } from "../../icons"
import AppStoreImg from "@/public/assets/icons/app-store.webp"
import PlayStoreImg from "@/public/assets/icons/google-play.webp"
import { APP_NAME } from "@/lib/constants";

export default function DownloadApp() {
  return (
    <div className="relative group">
      {/* Trigger */}
      <div className="flex items-center h-11 px-2 cursor-pointer">
        <span className="text-[32px]">
          <AppIcon />
        </span>
        <div className="ml-1">
          <b className="max-w-[90px] inline-block font-medium text-xs text-white">
            Download the {APP_NAME} app
          </b>
        </div>
      </div>
      {/* Modal */}
      <div className="absolute hidden top-0 group-hover:block cursor-pointer">
        <div className="relative mt-12 -ml-44 w-[300px] bg-[var(--card)] rounded-2xl text-main-primary pt-2 px-1 pb-6 z-50 shadow-lg">
          {/* Triangle */}
              <div className="w-0 h-0 absolute left-[149px] -top-1.5 right-10 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-[var(--card)]"></div>
          {/* Content */}
          <div className="py-3 px-1 break-words">
            <div className="flex">
              <div className="mx-3">
                <h3 className="font-semibold text-[18px] text-main-primary m-0 max-w-40 mx-auto">
                  Download the {APP_NAME} app
                </h3>
                <div className="mt-4 flex items-center gap-x-2">
                  <Link
                    href=""
                    className="rounded-3xl bg-black grid place-items-center px-4 py-3"
                  >
                    <Image src={AppStoreImg} alt="App store" />
                  </Link>
                  <Link
                    href=""
                    className="rounded-3xl bg-black grid place-items-center px-4 py-3"
                  >
                    <Image src={PlayStoreImg} alt="Play store" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
