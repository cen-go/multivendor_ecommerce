import { APP_NAME } from "@/lib/constants";
import Contact from "./contact";
import Links from "./links";
import Newsletter from "./newsletter";

export default function Footer() {
  return (
    <div className="w-full bg-white">
      <Newsletter />
      <div className="max-w-[1430px] mx-auto">
        <div className="p-5">
          <div className="grid md:grid-cols-2 md:gap-x-5">
            <Contact />
            <Links />
          </div>
        </div>
      </div>
      {/* Rights */}
      <div className="bg-gradient-to-r from-slate-500 to-slate-800 px-2 text-white">
        <div className="max-w-[1430px] mx-auto flex items-center h-7">
          <span className="text-sm">
            <b>© {APP_NAME}</b> - All Rights Reserved
          </span>
        </div>
      </div>
    </div>
  );
}
