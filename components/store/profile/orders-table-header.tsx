import { UserOrdersFilter, UserOrdersTimePeriod } from "@/actions/profile"
import { cn } from "@/lib/utils";
import { ChevronDown, FunnelXIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  filter: UserOrdersFilter;
  setFilter: Dispatch<SetStateAction<UserOrdersFilter>>;
  timePeriod: UserOrdersTimePeriod;
  setTimePeriod: Dispatch<SetStateAction<UserOrdersTimePeriod>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export default function OrdersTableHeader({
  filter,
  setFilter,
  timePeriod,
  setTimePeriod,
  searchTerm,
  setSearchTerm,
}: Props) {
  const router = useRouter();

  // Handle debounced search input
  const [ debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  // Update the searchTerm state with the debouncedSearch state after a little delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch.length >= 3 && debouncedSearch !== searchTerm) {
        setSearchTerm(debouncedSearch);
      } else if (debouncedSearch === "") {
        setSearchTerm("");
      }
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [debouncedSearch, setSearchTerm, searchTerm]);

  return (
    <div className="pt-4 px-6 bg-white overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        {/* Filters */}
        <div className="-ml-3 text-main-primary text-sm relative">
          <div className="py-4 inline-flex items-center bg-white justify-center relative">
            {filters.map((f) => (
              <div
                key={f.filter}
                className={cn(
                  "relative px-1.5 sm:px-4 text-main-primary whitespace-nowrap cursor-pointer leading-6",
                  {
                    "user-orders-table-tr font-bold": f.filter === filter,
                  }
                )}
                onClick={() => {
                  if (f.filter === "all") {
                    router.refresh();
                    setFilter(f.filter);
                  } else {
                    setFilter(f.filter);
                  }
                }}
              >
                {f.title}
              </div>
            ))}
          </div>
        </div>
        {/* Remove filters Button */}
        <div
          className="mt-0.5 text-sm text-main-primary cursor-pointer flex items-center"
          onClick={() => {
            setFilter("all");
            setTimePeriod("all");
            setSearchTerm("");
          }}
        >
          <span className="mx-1">
            <FunnelXIcon className="w-5" />
          </span>
          Remove all filters
        </div>
      </div>
      {/* Search Input - Date filter */}
      <div className="flex items-center flex-col sm:flex-row justify-between mt-3">
        {/* Sort and Search container */}
        <div className="w-max-[600px] text-main-primary text-sm leading-6 relative flex">
          {/* Select for sorting */}
          <div className="relative mb-4 w-fit">
            <select className="h-8 px-4 w-24 appearance-none outline-none cursor-pointer hover:border-orange-primary border rounded-l-md">
              <option
                value=""
                className="flex h-8 text-left text-sm overflow-hidden flex-1 whitespace-nowrap"
              >
                Order
              </option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="w-4" />
            </span>
          </div>
          {/* Input for search */}
          <input
            type="text"
            placeholder="Order ID, product or store name"
            className="h-8 border text-sm relative inline-block w-full py-[3px] px-3 text-main-primary leading-6 bg-white  transition-all duration-75 placeholder:text-xs"
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
          />
          {/* Search icon */}
          <span className="-ml-[1px] rounded-r-md relative bg-white text-center">
            <button className="rounded-r-md min-w-[52px] h-8 text-white bg-[linear-gradient(90deg,_#ff640e,_#ff3000)] grid place-items-center">
              <span className="text-2xl inline-block ">
                <SearchIcon />
              </span>
            </button>
          </span>
        </div>

        {/* Filter by date */}
        <div className="flex items-center">
          {/* Select */}
          <div className="relative mb-4 w-fit">
            <select
              className="h-8 px-4 w-40 appearance-none outline-none cursor-pointer hover:border-orange-primary border rounded-md"
              value={timePeriod}
              onChange={(e) =>
                setTimePeriod(e.target.value as UserOrdersTimePeriod)
              }
            >
              {date_filters.map((filter) => (
                <option
                  key={filter.value}
                  value={filter.value}
                  className="flex h-8 text-left text-sm overflow-hidden flex-1 whitespace-nowrap"
                >
                  {filter.title}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="w-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const filters: { title: string; filter: UserOrdersFilter }[] = [
  {
    title: "View all",
    filter: "all",
  },
  {
    title: "Unpaid",
    filter: "unpaid",
  },
  {
    title: "To ship",
    filter: "toShip",
  },
  {
    title: "Shipped",
    filter: "shipped",
  },
  {
    title: "Delivered",
    filter: "delivered",
  },
];

const date_filters: { title: string; value: UserOrdersTimePeriod }[] = [
  {
    title: "All time",
    value: "all",
  },
  {
    title: "last 6 months",
    value: "6-months",
  },
  {
    title: "last 1 year",
    value: "1-year",
  },
  {
    title: "last 2 years",
    value: "2-year",
  },
];