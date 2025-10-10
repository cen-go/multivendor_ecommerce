"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { subMonths, subYears } from "date-fns";

// Function: getUserOrders
// Description: Retrieves user orders, with populated groups and items,
//              item count, and shipping address.
// Parameters:
//   - filter: String to filter orders by.
//   - page: The current page number for pagination (default = 1).
//   - pageSize: The number of products per page (default = 10).
//   - search: the string to search by.
//   - period: The period of orders u wanna get.
// Returns: Array containing user orders with groups sorted by totalPrice in descending order.
export type UserOrdersFilter = "all" | "unpaid" | "toShip" | "shipped" | "delivered";
export type UserOrdersTimePeriod = "all" | "6-months" | "1-year" | "2-year"
export async function getUserOrders({
  filter = "all",
  page = 1,
  pageSize = 6,
  search = "",
  period = "all",
}: {
  filter?: UserOrdersFilter;
  page?: number;
  pageSize?: number;
  search?: string; // Search by product ID, store name  or product name
  period?: UserOrdersTimePeriod;
}) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }
  const skip = (page - 1) * pageSize;

  // Define base where statement for db query
  const whereClause: Prisma.OrderWhereInput = {
    AND: [
      {userId: user.id}
    ],
  }

  // Define filters
  if (filter === "unpaid") {
    (whereClause.AND as Prisma.OrderWhereInput[]).push({paymentStatus: PaymentStatus.PENDING})
  }
  if (filter === "toShip") {
    (whereClause.AND as Prisma.OrderWhereInput[]).push({orderStatus: OrderStatus.PROCESSING})
  }
  if (filter === "shipped") {
    (whereClause.AND as Prisma.OrderWhereInput[]).push({OR : [
      {orderStatus: OrderStatus.SHIPPED},
      {orderStatus: OrderStatus.ON_DELIVERY},
      {orderStatus: OrderStatus.PARTIALLY_SHIPPED},
    ]})
  }
  if (filter === "delivered") {
    (whereClause.AND as Prisma.OrderWhereInput[]).push({orderStatus: OrderStatus.DELIVERED})
  }

  // Define period filters
  const now = new Date();
  if (period === "6-months") {
    (whereClause.AND as Prisma.OrderWhereInput[]).push({createdAt: {gte: subMonths(now, 6)}});
  }
  if (period === "1-year") {
    (whereClause.AND as Prisma.OrderWhereInput[]).push({createdAt: {gte: subYears(now, 1)}});
  }
  if (period === "2-year") {
    (whereClause.AND as Prisma.OrderWhereInput[]).push({createdAt: {gte: subYears(now, 2)}});
  }

  // Apply the search filter
  if (search.trim() && search.trim().length >= 3) {
    (whereClause.AND as Prisma.OrderWhereInput[]).push({
      OR: [
        {id: {contains: search}}, // Search by order ID
        {
          orderGroups: {
            some: {
              store: {name: {contains: search}}, // Search by store
            },
          },
        },
        {
          orderGroups: {
            some: {
              orderItems: {
                some: {name: {contains: search}} // Search by product name
              }
            }
          }
        },
      ],
    });
  }

  const orders = await db.order.findMany({
    where: whereClause,
    include: {
      orderGroups: {
        include: {
          coupon: true,
          store: true,
          orderItems: true,
        },
        orderBy: { total: "desc" },
      },
      shippingAddress: {
        include: {
          country: true,
          user: true,
        },
      },
      paymentDetails: true,
    },
    skip,
    take: pageSize,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch the total count of orders
  const totalCount = await db.order.count({where: whereClause});
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    orders,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  };

}

// Function: getUserReviews
// Description: Retrieves paginated reviews for the authenticated user, with optional filters for rating and search functionality.
// Permission: User
// Parameters:
//   - filter: A string to filter reviews by rating (e.g., "5", "4", "3", "2", "1").
//   - page: The current page number for pagination (default = 1).
//   - pageSize: The number of reviews per page (default = 6).
//   - search: the string to search by.
//   - period: A string to filter reviews by creation date
// Returns: A Promise resolving to an object containing reviews and pagination data
export type UserReviewsQueryFilter = "1" | "2" | "3" | "4" | "5" | "all";
export type UserReviewsTimePeriodFilter = "all" | "6-months" | "1-year" | "2-year"
export async function getUserReviews({
  filter = "all",
  page = 1,
  pageSize = 5,
  search = "",
  period = "all",
}: {
  filter?: UserReviewsQueryFilter;
  page?: number;
  pageSize?: number;
  search?: string; // Search by product ID, store name  or product name
  period?: UserReviewsTimePeriodFilter;
}) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }

  const skip = pageSize * (page - 1);

  // Define base where statement for db query
  const whereClause: Prisma.ReviewWhereInput = {
    AND: [
      {userId: user.id}
    ],
  }

  // define rating filter
  if (filter && filter != "all") {
    (whereClause.AND as Prisma.ReviewWhereInput[]).push({rating: parseInt(filter)});
  }

  // Define filters for time period
  const now = new Date();
  if (period === "6-months") {
    (whereClause.AND as Prisma.ReviewWhereInput[]).push({createdAt: {gte: subMonths(now, 6)}});
  }
  if (period === "1-year") {
    (whereClause.AND as Prisma.ReviewWhereInput[]).push({createdAt: {gte: subYears(now, 1)}});
  }
  if (period === "2-year") {
    (whereClause.AND as Prisma.ReviewWhereInput[]).push({createdAt: {gte: subYears(now, 2)}});
  }

  // Apply search filter
  if (search.trim() && search.trim().length >= 4) {
    (whereClause.AND as Prisma.ReviewWhereInput[]).push({review : {contains: search}});
  }

  const reviews = await db.review.findMany({
    where: whereClause,
    include: {
      images: true,
      user: true,
    },
    skip,
    take: pageSize,
    orderBy: {createdAt: "desc"}
  });

  // Fetch the total count of reviews and calculate the total num of pages
  const reviewsCount = await db.review.count({where: whereClause});
  const totalPages = Math.ceil(reviewsCount / pageSize);

  return {
    reviews,
    totalPages,
    reviewsCount,
    currentPagge: page,
    pageSize,
  }
}