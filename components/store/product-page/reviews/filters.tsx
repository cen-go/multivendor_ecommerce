import { Dispatch, SetStateAction } from "react";
import { ReviewFilterType } from "./product-reviews";
import { RatingStatisticsType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  filters: ReviewFilterType;
  setFilters: Dispatch<SetStateAction<ReviewFilterType>>;
  setPage: Dispatch<SetStateAction<number>>;
  setSort: Dispatch<SetStateAction<"latest" | "oldest" | "highest" | "lowest">>;
  stats: RatingStatisticsType;
}

export default function ReviewsFilters({
  filters,
  setFilters,
  setPage,
  setSort,
  stats,
}: Props) {
  const { ratingStatistics, totalReviews, reviewsWithImages } = stats;
  return (
    <div className="mt-8 relative overflow-hidden">
      <div className="flex flex-wrap gap-4 text-sm">
        {/* All */}
        <div
          className={cn(
            "bg-[#f5f5f5] text-main-primary border border-transparent rounded-full cursor-pointer py-1.5 px-4",
            {
              "bg-[#ffebed] text-[#fd384f] border-[#fd384f]":
                !filters.rating && !filters.hasImages,
            }
          )}
          onClick={() => {
            setFilters({});
            setSort("latest");
            setPage(1);
          }}
        >
          All ({totalReviews})
        </div>
        {/* Reviews with images */}
        <div
          className={cn(
            "bg-[#f5f5f5] text-main-primary border border-transparent rounded-full cursor-pointer py-1.5 px-4",
            {
              "bg-[#ffebed] text-[#fd384f] border-[#fd384f]": filters.hasImages,
            }
          )}
          onClick={() => {
            setFilters((prevFilters) => ({
              ...prevFilters,
              hasImages: !filters.hasImages,
            }));
            setPage(1);
          }}
        >
          With Images ({reviewsWithImages})
        </div>
        {/* Rating Filters */}
        {ratingStatistics.map((rating) => (
          <div
            key={rating.rating}
            className={cn(
              "bg-[#f5f5f5] text-main-primary border border-transparent rounded-full cursor-pointer py-1.5 px-4",
              {
                "bg-[#ffebed] text-[#fd384f] border-[#fd384f]":
                  filters.rating === rating.rating,
              }
            )}
            onClick={() => {
              setFilters((prevFilters) => ({
                ...prevFilters,
                rating: rating.rating,
              }));
              setPage(1);
            }}
          >
            {rating.rating} ★ ({rating.numReviews})
          </div>
        ))}
      </div>
    </div>
  );
}
