"use client";

// React Next.js
import { useCallback, useEffect, useState } from "react";
// Types
import {
  RatingStatisticsType,
  ReviewSortOptionType,
  ReviewWithImagesType,
  VariantInfoType,
} from "@/lib/types";
// Components
import RatingCard from "../../cards/product-rating";
import RatingStatisticsCard from "../../cards/rating-statistics";
import ReviewCard from "../../cards/review-card";
import ReviewsFilters from "./filters";
import ReviewsSort from "./sort";
import Pagination from "@/components/shared/pagination";
import AddReview from "./add-review";
// Server Action & db queries
import { getProductFilteredReviews } from "@/actions/review";
// Constants
import { DEFAULT_REVIEWS_PAGE_SIZE } from "@/lib/constants";

interface Props {
  productId: string;
  rating: number;
  statistics: RatingStatisticsType;
  reviews: ReviewWithImagesType[];
  variantsInfo: VariantInfoType[];
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
  variantsInfo,
}: Props) {
  const [data, setData] = useState<ReviewWithImagesType[]>(reviews);

  // Local state for filters
  const [filters, setFilters] = useState<ReviewFilterType>({});

  // Local state for filters
  const [sortBy, setSortBy] = useState<ReviewSortOptionType>("latest");

  // Local state for Pagination
  const [page, setPage] = useState<number>(1);

  const pageSize = DEFAULT_REVIEWS_PAGE_SIZE;
  // Local state for total pages
  const [totalPages, setTotalPages] = useState<number>(
    Math.ceil(statistics.totalReviews / pageSize)
  );

  const handleReviews = useCallback(async () => {
    const res = await getProductFilteredReviews({
      productId,
      filters,
      sortBy,
      page,
    });
    setData(res.reviews);
    setTotalPages(res.totalPages);
  }, [productId, filters, sortBy, page]);

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
          <div className="mt-5 flex flex-col max-w-3xl gap-5">
            {data.length > 0 ? (
              data.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div>No reviews yet.</div>
            )}
          </div>
          {totalPages > 0 && (
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          )}
        </>
      )}
        <AddReview
          productId={productId}
          variantsInfo={variantsInfo}
          UpdateReviews={handleReviews}
        />
    </div>
  );
}
