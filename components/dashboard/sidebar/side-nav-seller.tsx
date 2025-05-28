"use client";

// React Next.js
import { usePathname } from "next/navigation";
import Link from "next/link";
// Shadcn components
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
// Types
import { DashboardSidebarMenuInterface } from "@/lib/types";
// Constants
import { icons } from "@/lib/constants/icons";
// cn utility fn
import { cn } from "@/lib/utils";

interface SidebarNavSellerProps {
  menuLinks: DashboardSidebarMenuInterface[];
}

export default function SidebarNavSeller({ menuLinks }: SidebarNavSellerProps) {
  const pathName = usePathname();
  const urlEndPart = pathName.split("/stores/")[1];
  const activeStore = urlEndPart.includes("/")
    ? urlEndPart.split("/")[0]
    : urlEndPart;

  return (
    <nav className="relative grow">
      <Command className="overflow-visible bg-transparent">
        <CommandInput placeholder="Search..." />
        <CommandList className="py-2 overflow-visible">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="pt-0 relative overflow-visible">
            {menuLinks.map((link, index) => {
              let icon;
              const iconSearch = icons.find((i) => i.value === link.icon);
              if (iconSearch) icon = <iconSearch.path />;
              return (
                <CommandItem
                  key={index}
                  className={cn(
                    "w-full h-12 mt-1 cursor-pointer",
                    `/dashboard/seller/stores/${activeStore}${
                      link.link ? `/${link.link}` : ""
                    }` === pathName
                      ? "bg-accent text-accent-foreground"
                      : ""
                  )}
                >
                  <Link
                    href={`/dashboard/seller/stores/${activeStore}/${link.link}`}
                    className="w-full flex items-center gap-3 transition-all"
                  >
                    {icon}
                    <span>{link.label}</span>
                  </Link>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </nav>
  );
}
