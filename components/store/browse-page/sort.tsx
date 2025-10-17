"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortArray = [
  {
    name: "Most Popular",
    query: "most-popular",
  },
  {
    name: "New Arrivals",
    query: "new-arrivals",
  },
  {
    name: "Top Rated",
    query: "top-rated",
  },
  {
    name: "Price low to high",
    query: "price-low-to-high",
  },
  {
    name: "Price High to low",
    query: "price-high-to-low",
  },
];

export default function ProductsSort() {
  const searchParams = useSearchParams();
  const queryParams = new URLSearchParams(searchParams);
  const pathname = usePathname();
  const router = useRouter();

  const sortQuery = searchParams.get("sort") ?? "most-popular";

  const sortKey = sortQuery
    ? sortArray.find((s) => s.query === sortQuery)?.name
    : "Most Popular";

  function handleSort(sortValue: string) {
    queryParams.set("sort", sortValue);
    router.replace(`${pathname}?${queryParams.toString()}`);
  }

  return (
    <div className="flex items-center">
      <p className="font-semibold text-sm">Sort by: </p>
      <Select onValueChange={(value) => handleSort(value)}>
        <SelectTrigger className="border-none shadow-none cursor-pointer focus:ring-0 focus:ring-offset-0 focus-visible:ring-0">
          <SelectValue placeholder={sortKey} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sortArray.map((s) => (
              <SelectItem key={s.query} value={s.query}>
                {s.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
