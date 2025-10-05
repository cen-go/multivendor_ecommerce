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
export async function getUserOrders({
  filter = "all",
  page = 1,
  pageSize = 6,
  search = "",
  period = "all",
}: {
  filter?: "all" | "unpaid" | "toShip" | "shipped" | "delivered";
  page?: number;
  pageSize?: number;
  search?: string; // Search by product ID, store name  or product name
  period?: "all" | "6-months" | "1-year" | "2-year";
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
    (whereClause.AND as Prisma.OrderWhereInput[]).push({orderStatus: OrderStatus.SHIPPED})
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
  if (search.trim()) {
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
                some: {name: search} // Search by product name
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
