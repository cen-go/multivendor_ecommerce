import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import { ChevronDownIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";

export default function CategoriesMenu({
  categories,
  open,
  setOpen,
}: {
  categories: Category[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  function toggleMenu(state: boolean) {
    setOpen(state);
    // Delay Showing the dropdown menu intil the trigger's animation is finished
    if (state) {
      setTimeout(() => setDropdownVisible(true), 100);
    } else {
      setDropdownVisible(false);
    }
  }

  return (
    <div
      className="ANA-DIV relative w-10 h-10 xl:w-[256px] z-60"
      onTouchStart={() => toggleMenu(!open)}
      onMouseEnter={() => toggleMenu(true)}
      onMouseLeave={() => toggleMenu(false)}
    >
      {/* Trigger and dropdown container */}
      <div className="relative">
        {/* Trigger */}
        <div
          className={cn(
            "w-12 xl:w-[256px] h-12 xl:h-11 text-lg relative z-50 flex items-center cursor-pointer transition-all duration-100 ease-in-out -translate-y-1 xl:translate-y-0",
            {
              "w-[256px] bg-[#f5f5f5] text-black text-base rounded-t-[20px] rounded-b-none scale-100":
                open,
              "scale-75 rounded-full bg-[#535353] text-white": !open,
            }
          )}
        >
          {/* Menu Icon with transition to move right when open */}
          <MenuIcon
            className={cn("absolute top-1/2 -translate-y-1/2 xl:ml-1", {
              "left-5": open,
              "left-3": !open,
            })}
          />
          <span
            className={cn("hidden xl:inline-flex xl:ml-11", {
              "inline-flex !ml-14": open,
            })}
          >
            All Categories
          </span>
          <ChevronDownIcon className={cn("hidden xl:inline-flex absolute right-3 scale-75", {"inline-flex": open})} />
        </div>

        {/* Dropdown Menu */}
        {/* Backdrop */}
        {open && dropdownVisible && (
          <div
            className="fixed lg:hidden inset-0  z-30 bg-black/10"
            onClick={() => toggleMenu(false)}
            onMouseEnter={() => toggleMenu(false)}
            aria-label="Close menu"
            tabIndex={-1}
          />
        )}
        {/* Menu content */}
        <ul className={cn("absolute top-10 left-0 w-[256px] bg-[#f5f5f5] shadow-lg transition-all duration-100 ease-in-out z-50 overflow-y-auto scrollbar", {
          "opacity-100 max-h-[523px]": dropdownVisible,
          "opacity-0 max-h-0": !dropdownVisible,
        })}>
          {categories.map(ctg => (
            <Link href={`/browse?category=${ctg.url}`} key={ctg.id}>
              <li className="relative flex items-center m-0 p-3 pl-6 hover:bg-white">
                <Image src={ctg.image} alt={ctg.name} height={80} width={80} className="w-10 h-10"/>
                <span className="text-sm font-normal ml-2 overflow-hidden line-clamp-2 break-words text-main-primary">{ctg.name}</span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}
