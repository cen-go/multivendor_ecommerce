"use server"

import db from "@/lib/db";
import { ReviewDetailsType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";

// Function: upsertReview
// Description: Upsersts a review into the database, updating if it exists or creating a new one.
// Permission Level: Admin only for creation and update of reviews
// Parameters:
//   - ProductId
//   - review: An object containing details of the review
// Returns: review details.
export async function upsertReview(productId: string, review: ReviewDetailsType) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "Not authenticated." };
    }

    // update or create the review
    const reviewDetails = await db.review.upsert({
      where: { id: review.id },
      update: {
        ...review,
        images: {
          deleteMany: {},
          create: review.images.map(img => ({ url: img.url })),
        },
      },
      create: {
        review: review.review,
        rating: review.rating,
        images: {
          create: review.images.map(img => ({url: img.url}))
        },
        variant: review.variant,
        size: review.size,
        color: review.color,
        productId,
        userId: user.id
      },
    });

    // Calculate the average rating
    const averageRating = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    // throw an error if average rating is null
    if (!averageRating._avg.rating) {
      throw new Error("Error calculating the average rating!");
    }
    // update the rating and number of reviews fields in the related product
    await db.product.update({
      where: {id: productId},
      data: {
        rating: averageRating._avg.rating,
        numReviews: averageRating._count,
      },
    });

    return {
      success: true,
      message: `Your review has successfully ${review.id ? "updated" : "created"}.`,
      data: reviewDetails,
    };
  } catch (error) {
    console.error("Error creating or updating the review", error);
    return { success: false, message: "An unexpected error occured." };
  }
}