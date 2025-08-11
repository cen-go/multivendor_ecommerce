import { cn } from "@/lib/utils";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";

interface Props {
  page: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>;
}
export default function Pagination({ page, totalPages, setPage }: Props) {
  const pages = Array.from({length: totalPages}).map((_, i) => i + 1);

  function handlePagination(btnType: "next" | "prev") {
    const targetPage = btnType === "next" ? page +1 : page - 1;

    setPage(targetPage);
  }

  return (
    <div className="w-full py-10 lg:px-0 sm:px-6 px-4">
      <div className="w-full flex items-center justify-end gap-x-4 border-t">
        <Button
          variant="ghost"
          className="flex items-center mt-3 text-gray-600 hover:text-orange-background hover:bg-transparent cursor-pointer"
          onClick={() => handlePagination("prev")}
          disabled={page === 1}
        >
          <MoveLeftIcon className="w-3" />
          <p className="text-sm ml-2 font-medium leading-none">Previous</p>
        </Button>
        <div className="flex flex-wrap">
          {pages.map((p) => (
            <div
              key={p}
              className={cn(
                "text-sm font-medium leading-none cursor-pointer text-gray-600  hover:text-orange-background  border-t border-transparent pt-3 mr-4 px-2",
                {
                  "font-bold border-orange-background hover:text-gray-600": p === page,
                }
              )}
              onClick={() => setPage(p)}
            >
              {p}
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="flex items-center mt-3 px-0 text-gray-600 hover:text-orange-background hover:bg-transparent cursor-pointer"
          onClick={() => handlePagination("next")}
          disabled={page === totalPages}
        >
          <p className="text-sm mr-3 font-medium leading-none">Next</p>
          <MoveRightIcon className="w-3" />
        </Button>
      </div>
    </div>
  );
}
