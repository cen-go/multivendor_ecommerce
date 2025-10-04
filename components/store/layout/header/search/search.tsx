"use client"

// React & Next.js
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
// Types
import { SearchResultsType } from "@/lib/types";

import { SearchIcon } from "lucide-react";
import SearchSuggestions from "./suggestions";

export default function Search() {
  const srchParams = useSearchParams();
  const pathname = usePathname();
  const searchParams = new URLSearchParams(srchParams);
  const router = useRouter();
  const[searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SearchResultsType[]>([]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (pathname !== "/browse") {
      router.push(`/browse?search=${searchQuery}`);
    } else {
      if (!searchQuery) {
        searchParams.delete("search");
      } else {
        searchParams.set("search", searchQuery);
      }
      router.replace(`${pathname}?${searchParams.toString()}`);
    }
  }

  async function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target.value;
    setSearchQuery(input);

    if (input.length > 2) {
      try {
        const response = await fetch(`/api/search-products?search=${input}`);
        const data = await response.json();
        setSuggestions(data);
      } catch {
        console.error("An error occured during search!")
      }
    }
  }

  return (
    <div className="relative lg:w-full flex-1">
      <form
        className="h-10 rounded-3xl bg-white relative border-none flex"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Search..."
          className="bg-white text-black flex-1 border-none pl-2.5 m-2.5 outline-none"
          value={searchQuery}
          onChange={handleInputChange}
        />
        {suggestions.length > 0 && (
          <SearchSuggestions
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            setSearchQuery={setSearchQuery}
          />
        )}
        <button
          type="submit"
          className="border rounded-[20px] w-[56px] h-8 mt-1 mb-0 ml-0 mr-1 bg-gradient-to-r from-slate-500 to-slate-600 grid place-items-center cursor-pointer"
        >
          <SearchIcon />
        </button>
      </form>
    </div>
  );
}
