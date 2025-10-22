"use server"

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

// Function: getOrder
// Description: Retrieves a specific order by its ID and the current user's ID, including associated groups, items, store information,
//              item count, and shipping address.
// Parameters:
//   - params: orderId.
// Returns: Object containing order details with groups sorted by totalPrice in descending order.
export async function getOrder(orderId: string) {
  // Get the current user
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }

  const order = await db.order.findUnique({
    where: {
      id: orderId,
      userId: user.id,
    },
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
  });

  return order;
}

/**
 * @name updateOrderGroupStatus
 * @description - Updates the status of a specified order group.
 *              - Throws an error if the user is not authenticated or lacks seller privileges.
 * @access User
 * @param storeId - The store id of the seller to verify ownership.
 * @param groupId - The ID of the order group whose status is to be updated.
 * @param status - The new status to be set for the order.
 * @returns {Object} - Updated order status.
 */