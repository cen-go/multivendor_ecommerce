// React Next.js
import Link from "next/link";
import { cookies } from "next/headers";
// Constants
import { APP_NAME } from "@/lib/constants";
// Components
import UserMenu from "./userMenu/user-menu";
import Cart from "./cart";
import CountryLanguageCurrencySelector from "./country-lang-currency-selector";
// import DownloadApp from "./download-app";
import Search from "./search/search";
// Types
import { UserCountry } from "@/lib/types";

export default async function StoreHeader() {
  const storeCookies = await cookies();
  const userCountryCookie = storeCookies.get("userCountry");

  // Default country if the cookie is missing
  let userCountry: UserCountry = {
    name: "United States",
    code: "US",
  };

  // If cookie exists update the user country
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value);
  }

  return (
    <header className="bg-gradient-to-r from-slate-500 to-slate-800">
      <div className="h-full w-full lg:flex text-white px-4 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:flex-1 lg:w-full gap-3 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="font-extrabold text-3xl font-mono">{APP_NAME}</h1>
            </Link>
            <div className="flex lg:hidden sm:gap-1">
              {/* <DownloadApp /> */}
              <CountryLanguageCurrencySelector userCountry={userCountry} />
              <UserMenu />
              <Cart />
            </div>
          </div>
          <Search />
        </div>
        <div className="hidden lg:flex gap-4 w-full lg:w-fit lg:mt-2 justify-end mt-1.5 pl-6">
          <CountryLanguageCurrencySelector userCountry={userCountry} />
          <UserMenu />
          <Cart />
        </div>
      </div>
    </header>
  );
}
