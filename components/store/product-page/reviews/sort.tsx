import { ReviewSortOptionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

interface Props {
  sort: ReviewSortOptionType;
  setSort: Dispatch<SetStateAction<"latest" | "oldest" | "highest" | "lowest">>;
  setPage: Dispatch<SetStateAction<number>>;
}

const sortOptions = ["latest" , "oldest" , "highest" , "lowest"]

export default function ReviewsSort({ sort, setSort, setPage }: Props) {
  return (
    <div className="flex text-sm gap-3">
      <div>Sort by: </div>
      {sortOptions.map((option) => (
        <div
          key={option}
          className={cn("text-main-secondary hover:underline cursor-pointer", {
            "text-[#fd384f] underline cursor-default" : sort === option
          })}
          onClick={() => {
            setSort(option as ReviewSortOptionType);
            setPage(1);
          }}
        >
          {option}
        </div>
      ))}
    </div>
  );
}
