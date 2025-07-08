"use client"

// React, Next.js
import { useState } from "react";
// Types
import { SelectMenuOption, UserCountry } from "@/lib/types";
// Icons
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { ChevronDownIcon } from "lucide-react";
// Components
import CountrySelector from "@/components/shared/country-selector";
// Data
import COUNTRIES from "@/lib/data/countries.json";

export default function CountryLanguageCurrencySelector({
  userCountry,
}: {
  userCountry: UserCountry;
}) {
  // State for opening and closing the modal
  const [open, setOpen] = useState(false);
  // State for opening and closing the modal
  const [countryOptionsOpen, setCountryOptionsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <div onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center h-11 py-0 px-2 cursor-pointer">
          <span className="mr-0.5 h-[33px] grid place-items-center">
            <span className={`fi fi-${userCountry.code.toLocaleLowerCase()}`} />
          </span>
          <div className="ml-1">
            <div className="text-xs text-white leading-3 mt-2">
              {userCountry.name} / EN
            </div>
            <b className="text-xs font-bold text-white">
              USD{" "}
              <span className="scale-[60%] align-middle inline-block">
                <ChevronDownIcon />
              </span>
            </b>
          </div>
        </div>
      </div>
      {/* Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0  z-30 bg-black/10"
            onClick={() => {
              setOpen(false);
              setCountryOptionsOpen(false);
            }}
            aria-label="Close menu"
            tabIndex={-1}
          />
          <div className="absolute top-0 cursor-pointer">
            <div className="relative mt-12 -ml-32 w-[300px] text-main-primary pt-2 px-6 pb-6 z-50 bg-white
             rounded-3xl shadow-lg">
              {/* Triangle */}
              <div className="w-0 h-0 absolute left-[149px] -top-1.5 right-24 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white"></div>
              {/* Content */}
              <div className="mt-4 leading-6 text-lg font-semibold"> Ship to</div>
              <div className="mt-2">
                <div className="relative text-main-primary bg-indigo-300 rounded-lg">
                  <CountrySelector
                    id={"countries"}
                    open={countryOptionsOpen}
                    onToggle={() => setCountryOptionsOpen(!countryOptionsOpen)}
                    onChange={(val) => {return val}} //setCountry(val)
                    // We use this type assertion because we are always sure this find will return a value but need to let TS know since it could technically return null
                    selectedValue={
                      COUNTRIES.find(
                        (option) => option.name === userCountry.name
                      ) as SelectMenuOption
                    }
                  />
                </div>
              </div>
              {/* Language Selector */}
              {/* Currency Selector */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
