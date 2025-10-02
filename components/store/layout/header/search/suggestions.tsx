import { SearchResultsType } from "@/lib/types"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface Props {
  suggestions: SearchResultsType[];
  setSuggestions: Dispatch<SetStateAction<SearchResultsType[]>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
}

export default function SearchSuggestions({ suggestions, setSuggestions, setSearchQuery}: Props) {
  const router = useRouter();

  function handleClick(link: string) {
    router.push(link);
    setSuggestions([]);
    setSearchQuery("");
  }
  return (
    <div className="absolute top-11 w-full py-2 rounded-3xl bg-white text-main-primary shadow-2xl !z-[99] overflow-hidden">
      <ul>
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.link}
            className="w-full h-20 px-6 cursor-pointer hover:bg-[#f5f5f5] flex items-center gap-x-2"
            onClick={() => handleClick(suggestion.link)}
          >
              <Image
                src={suggestion.image}
                alt={suggestion.name}
                width={80}
                height={80}
                className="w-16 h-16 rounded-md object-cover"
              />
              <span className="text-sm leading-6 my-1.5 line-clamp-2 sm:line-clamp-none">
                {suggestion.name}
              </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
