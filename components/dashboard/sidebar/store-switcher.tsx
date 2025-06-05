"use client";

// React & Next.js
import Link from "next/link";
import { useParams } from "next/navigation";
// Shad cn components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronsUpDown, PlusIcon, StoreIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Store } from "@prisma/client";

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface StoreSwitcherProps extends PopoverTriggerProps {
  stores: Store[];
}

export default function StoreSwitcher({
  stores,
  className,
}: StoreSwitcherProps) {
  const params = useParams();
  const activeStoreUrl = params.storeUrl;

  const activeStore = stores.find((store) => activeStoreUrl === store.url);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("w-[250px] justify-between", className)}
          role="combobox"
          aria-label="Select a store"
        >
          <StoreIcon className="mr-2 w-4 h-4" />
          {activeStore?.name}
          <ChevronsUpDown className="ml-auto w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 flex flex-col">
        <p className="ps-3 py-1 border-b text-muted-foreground">Your stores</p>
        {stores.map((store) => (
          <Button
            key={store.id}
            asChild
            variant="ghost"
            className="w-full py-5"
          >
            <Link
              href={`/dashboard/seller/stores/${store.url}`}
              className="justify-start text-lg"
            >
              <StoreIcon className="mr-2 w-4 h-4" />
              {store.name}
              <CheckIcon
                className={cn(
                  "ml-auto",
                  store.url === activeStoreUrl ? "opacity-100" : "opacity-0"
                )}
              />
            </Link>
          </Button>
        ))}
        <Button
            asChild
            variant="ghost"
            className="w-full py-5 border-t rounded-t-none"
          >
            <Link
              href="/dashboard/seller/stores/new"
              className="justify-start text-lg"
            >
              <PlusIcon className="mr-2 w-4 h-4" />
              Create New Store
            </Link>
          </Button>
      </PopoverContent>
    </Popover>
  );
}
