"use client"

import { RatingStatisticsType, ReviewWithImagesType } from "@/lib/types";
import RatingCard from "../../cards/product-rating";
import RatingStatisticsCard from "../../cards/rating-statistics";
import { useState } from "react";
import ReviewCard from "../../cards/review-card";

interface Props {
  productId: string;
  rating: number;
  statistics: RatingStatisticsType;
  reviews: ReviewWithImagesType[];
}
export default function ProductReviews({
  productId,
  rating,
  statistics,
  reviews,
}: Props) {
  const [data, setData] = useState<ReviewWithImagesType[]>(reviews);
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
            {/* Review sorting */}
          </div>
          {/* Reviews */}
          <div className="mt-10 min-h-72 grid md:grid-cols-2 gap-6">
            {data.length > 0 ? (
              data.map(review => (
                <ReviewCard key={review.id} review={review}/>
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
