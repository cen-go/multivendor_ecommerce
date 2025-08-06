import { ReviewWithImagesType } from "@/lib/types";
import Image from "next/image";
import RatingStars from "../shared/rating-stars";
import { formatDateTime } from "@/lib/utils";

export default function ReviewCard({review}: {review: ReviewWithImagesType}) {
  const { user, images } = review;

  return (
    <div className="border rounded-xl flex h-fit relative py-4 px-2.5">
      {/* profile pic and name */}
      <div className="w-16 px-2 space-y-1 overflow-hidden">
        <Image src={user.picture} alt="Profile image" width={80} height={80} className="w-11 h-11 rounded-full object-cover" />
        <span className="text-xs text-main-secondary">{user.name}</span>
      </div>
      <div className="flex flex-1 flex-col justify-between leading-5 overflow-hidden px-2">
        <div className="space-y-2">
          <RatingStars value={review.rating} />
          <div className="flex items-center gap-x-2 text-main-secondary text-sm">
            <p>{review.variant}</p>
            <span className="font-bold text-main-primary">&middot;</span>
            <p>{review.size}</p>
          </div>
          <p className="text-main-secondary text-sm">Reviewed on {formatDateTime(review.createdAt).dateOnly}</p>
          <p className="text-sm">{review.review}</p>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map(img => (
                <div key={img.id} className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer">
                  <Image src={img.url} alt={img.alt} width={100} height={100} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
