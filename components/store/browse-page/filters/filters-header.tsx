"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductQueryFiltersType } from "@/lib/types"; // Types
import { XIcon } from "lucide-react";

export default function FiltersHeader({queries}: {queries: ProductQueryFiltersType}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const queryParams = new URLSearchParams(searchParams);

  // Destructure the queriens into an array format
  const queriesArray = Object.entries(queries);
  // Calculate the number of the applied filters
  const queriesLength = queriesArray.reduce((count, [queryKey, queryValue]) => {
    if (queryKey === "sort") return count;
    return (count + (Array.isArray(queryValue) ? queryValue.length : 1));
  }, 0);

  // Handle clearing all filters
  function handleClearAllFilters() {
    queryParams.forEach((value, key) => queryParams.delete(key));
    router.replace(pathname);
  }

  // handle removing specific filters or search queries
  function handleRemoveFilter(filterKey: string,arrayValue?: string[],specificValue?: string,) {
    if (specificValue && arrayValue) {
      // remove the value from the values array. if the filter value is an array like the sizes filter
      const updatedArray = arrayValue.filter(
        (value) => value !== specificValue
      );
      queryParams.delete(filterKey); // remove the search param completely
      // Add the remaining search param values in the array one by one
      updatedArray.forEach((val) => queryParams.append(filterKey, val));
    } else {
      queryParams.delete(filterKey);
    }

    router.replace(`${pathname}?${queryParams.toString()}`);
  }

  return (
    <div className="pt-2.5 pb-5">
      <div className="flex items-center justify-between h-4 leading-5">
        <div className="text-sm font-bold">Filter ({queriesLength})</div>
        {queriesLength > 0 && (
          <div
            className="text-xs text-orange-background cursor-pointer hover:underline"
            onClick={handleClearAllFilters}
          >
            Clear All
          </div>
        )}
      </div>
      {/* Display filters */}
      <div className="mt-3 flex flex-wrap gap-2">
        {queriesArray.map(([queryKey, queryValue]) => {
          if (queryKey === "sort") return null;
          if (queryKey === "search" && queryValue === "") return null;
          const isArrayQuery = Array.isArray(queryValue);
          const queryValues = isArrayQuery ? queryValue : [queryValue];

          return (
            <div key={queryKey} className="flex flex-wrap gap-2">
              {queryValues.map((value, index) => (
                <div
                  key={index}
                  className="border cursor-pointer py-0.5 px-1.5 rounded-sm text-sm w-fit text-center"
                >
                  <span className="text-main-secondary overflow-hidden text-ellipsis whitespace-nowrap mr-2">
                    {value}
                  </span>
                  <XIcon
                    className="w-3 text-main-secondary hover:text-black cursor-pointer inline-block"
                    onClick={() => {
                      if (isArrayQuery) {
                        handleRemoveFilter(queryKey, queryValues, value,)
                      } else {
                        handleRemoveFilter(queryKey)
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
