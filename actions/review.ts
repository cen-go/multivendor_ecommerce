"use server"

// Database client
import db from "@/lib/db";
import { Prisma } from "@prisma/client";
// Validation schemas
import { AddReviewSchema } from "@/lib/schemas";
// Types
import { ReviewDetailsType } from "@/lib/types";
// Clerk
import { currentUser } from "@clerk/nextjs/server";
// Constants
import { DEFAULT_REVIEWS_PAGE_SIZE } from "@/lib/constants";

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

    // Validate the form data at backend
    const validatedReview = AddReviewSchema.safeParse(review);

    if (!validatedReview.success) {
      const errors = validatedReview.error.flatten();
      return {
        success: false,
        message: "validation failed.",
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      };
    }

    // Check if the user have an existing review
    const existingReview = await db.review.findFirst({
      where: {
        productId,
        userId: user.id,
      }
    });

    // Add the existing review's ID to the form data to update the existing one
    if (existingReview) {
      review.id = existingReview.id;
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

// Function: getProductFilteredReviews
// Description: Fetches filtered and sorted reviews for a product from the database, with the pagination.
// Permission Level: Public
// Parameters:
//   - ProductId
//   - Filters: An object containing filter options such as rating or reviews with images.
//   - sortBy: An object defining the sort order, such as latest, oldest or highest-lowest rating
//   - page: the current page number for pagination. (default = 1)
//   - pageSize: the number of reviews to be fetched per page.
// Returns: An object containing a list of sorted and filtered reviews.
export async function getProductFilteredReviews({
  productId,
  filters,
  sortBy,
  page = 1,
  pageSize = DEFAULT_REVIEWS_PAGE_SIZE,
}: {
  productId: string;
  filters?: { rating?: number; hasImages?: boolean};
  sortBy?: "latest" | "oldest" | "highest" | "lowest";
  page?: number;
  pageSize?: number
}) {
  // define the filter for db query if filtering data is provided
  const reviewFilter: Prisma.ReviewWhereInput = {
    productId,
  };

  if (filters?.rating) {
    reviewFilter.rating = filters.rating
  }

  if (filters?.hasImages) {
    reviewFilter.images = {some: {}};
  }

  // define the orderBy object for prisma query
  let orderBy: Prisma.ReviewOrderByWithRelationInput = {createdAt: "desc"}; // default: latest

  if (sortBy === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sortBy === "highest") {
    orderBy = { rating: "desc" };
  } else if (sortBy === "lowest") {
    orderBy = { rating: "asc" };
  }

  const filteredReviewCount = await db.review.count({
    where: reviewFilter,
  });

  const filteredReviews = await db.review.findMany({
    where: reviewFilter,
    include: {
      images: true,
      user: true,
    },
    orderBy,
    skip: pageSize * (page - 1),
    take: pageSize,
  });

  return {
    reviews: filteredReviews,
    totalPages: Math.ceil(filteredReviewCount / pageSize),
  };
}