"use client"

import { RatingStatisticsType, ReviewSortOptionType, ReviewWithImagesType } from "@/lib/types";
import RatingCard from "../../cards/product-rating";
import RatingStatisticsCard from "../../cards/rating-statistics";
import { useCallback, useEffect, useState } from "react";
import ReviewCard from "../../cards/review-card";
import { getProductFilteredReviews } from "@/actions/product";
import ReviewsFilters from "./filters";
import ReviewsSort from "./sort";

interface Props {
  productId: string;
  rating: number;
  statistics: RatingStatisticsType;
  reviews: ReviewWithImagesType[];
}

export interface ReviewFilterType {
  rating?: number;
  hasImages?: boolean;
}

export default function ProductReviews({
  productId,
  rating,
  statistics,
  reviews,
}: Props) {
  const [data, setData] = useState<ReviewWithImagesType[]>(reviews);

  // Local state for filters
  const [filters, setFilters] = useState<ReviewFilterType>({})

  // Local state for filters
  const [sortBy, setSortBy] = useState<ReviewSortOptionType>("latest");

  // Local state for Pagination
  const [page, setPage] = useState<number>(1);

  const handleReviews = useCallback(
    async () => {
      const res = await getProductFilteredReviews({productId, filters, sortBy, page });
    setData(res);
    },
    [productId, filters, sortBy, page],
  );

  useEffect(() => {
    async function fetchReviews() {
      await handleReviews();
    }

    fetchReviews();
  }, [filters, sortBy, page, handleReviews]);

  return (
    <div id="reviews" className="mt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">
          Reviews ({statistics.totalReviews})
        </h2>
      </div>
      {/* Statistics */}
      <div className="w-full flex items-center gap-4">
        {/* Rating card */}
        <RatingCard rating={rating} />
        {/* Rating stats card */}
        <RatingStatisticsCard stats={statistics.ratingStatistics} />
      </div>
      {statistics.totalReviews > 0 && (
        <>
          <div className="space-y-6">
            {/* Review filters */}
            <ReviewsFilters
              filters={filters}
              stats={statistics}
              setFilters={setFilters}
              setSort={setSortBy}
              setPage={setPage}
            />
            {/* Review sorting */}
            <ReviewsSort sort={sortBy} setSort={setSortBy} setPage={setPage} />
          </div>
          {/* Reviews */}
          <div className="mt-5 min-h-72 flex flex-col max-w-3xl gap-6">
            {data.length > 0 ? (
              data.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div>No reviews yet.</div>
            )}
          </div>
          {/* Pagination */}
        </>
      )}
    </div>
  );
}
