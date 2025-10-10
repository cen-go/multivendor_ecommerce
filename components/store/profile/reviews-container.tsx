"use client"

import { getUserReviews, UserReviewsQueryFilter, UserReviewsTimePeriodFilter } from "@/actions/profile";
import { ReviewWithImagesType } from "@/lib/types";
import { useEffect, useState } from "react";
import ReviewsContainerHeader from "./reviews-container-header";
import Pagination from "@/components/shared/pagination";
import ReviewCard from "../cards/review-card";

interface Props {
  reviews: ReviewWithImagesType[];
  totalPages: number;
}

export default function ReviewsContainer({reviews, totalPages}: Props) {
  const [tableData, setTableData] = useState<ReviewWithImagesType[]>(reviews);
  const [page, setPage] = useState(1);
  const [totalDataPages, setTotalDataPages] = useState(totalPages);

  // States for filtering and search
  const [filter, setFilter] = useState<UserReviewsQueryFilter>("all");
  const [timePeriod, setTimePeriod] = useState<UserReviewsTimePeriodFilter>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    setPage(1);
  }, [filter, timePeriod, searchTerm]);

  useEffect(() => {
    async function getReviews() {
      const response = await getUserReviews({
        page,
        filter,
        period: timePeriod,
        search: searchTerm,
      });
      if (response.reviews) {
        setTableData(response.reviews);
        setTotalDataPages(response.totalPages);
      }
    }

    getReviews();
  }, [page, filter, timePeriod, searchTerm]);

  return (
    <div>
      {/* Header */}
      <ReviewsContainerHeader
        filter={filter}
        setFilter={setFilter}
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      {/* Reviews */}
      <div className="bg-white lg:px-6 pt-1 pb-8 overflow-hidden">
        <div className="max-h-[700px] overflow-x-auto overflow-y-auto rounded-md">
          <div className="space-y-3">
            {tableData.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <Pagination
            totalPages={totalDataPages}
            page={page}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}
