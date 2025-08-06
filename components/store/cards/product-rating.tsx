import RatingStars from "../shared/rating-stars";

export default function RatingCard({ rating }: { rating: number }) {
  const fixed_rating = Number(rating.toFixed(1));
  return (
    <div className="h-44 flex-1">
      <div className="p-6 bg-[#f5f5f5] flex flex-col h-full justify-center overflow-hidden rounded-lg">
        <div className="text-6xl font-bold">{rating}</div>
        <div className="py-1.5">
          <RatingStars value={fixed_rating} />
        </div>
        <div className="text-green-600 leading-5 mt-2">
          All from verified purchases
        </div>
      </div>
    </div>
  );
}