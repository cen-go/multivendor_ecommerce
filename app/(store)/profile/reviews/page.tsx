import { getUserReviews } from "@/actions/profile"
import ReviewsContainer from "@/components/store/profile/reviews-container"

export default async function UserReviewsPage() {
  const reviews = await getUserReviews({})
  return (
    <div className="bg-white py-4 px-4">
      <h1 className="text-lg mb-3 font-bold">Your reviews</h1>
      <ReviewsContainer reviews={reviews.reviews} totalPages={reviews.totalPages} />
    </div>
  )
}