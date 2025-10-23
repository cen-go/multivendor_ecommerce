"use server"

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { OrderStatus, ProductStatus, Role } from "@prisma/client";

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
export async function updateOrderGroupStatus(storeId: string, groupId: string, status: OrderStatus) {
  try {
    const user = await currentUser();
    if (!user) {
      return {success: false, message: "Unauthenticated!" };
    }

    // Verify the user is an seller
    if (user.privateMetadata.role !== Role.SELLER) {
      return {success: false, message: "Unauthorized Access: Seller privileges required." };
    }

    const store = await db.store.findUnique({where: {id: storeId}});

    if (!store) {
      return {success: false, message: "Store not found" };
    }
    // Verify the store ownership
    if (store.userId !== user.id) {
      return {success: false, message: "You don't have permission for this." };
    }

    // Fetch the order that is to be updated
    const orderGroup = await db.orderGroup.findUnique({
      where: {
        id: groupId,
        storeId: storeId,
      },
    });

    if (!orderGroup) {
      return {success: false, message: "Order not found" };
    }

    const updatedGroup = await db.orderGroup.update({
      where: {id: groupId},
      data: {
        status,
      },
    });

    return {success: true, message: "Order status successfully updated.", status: updatedGroup.status};
  } catch (error) {
    console.error("Error updating the order status: ", error);
      return {success: false, message: "An unexpected error occurred." };
  }
}

/**
 * @name updateOrderItemStatus
 * @description - Updates the status of a specified order group.
 *              - Throws an error if the user is not authenticated or lacks seller privileges.
 * @access User
 * @param storeId - The store id of the seller to verify ownership.
 * @param groupId - The ID of the order group whose status is to be updated.
 * @param status - The new status to be set for the order.
 * @returns {Object} - Updated order status.
 */
export async function updateOrderItemStatus(storeId: string, OrderItemId: string, status: ProductStatus) {
  try {
    const user = await currentUser();
    if (!user) {
      return {success: false, message: "Unauthenticated!" };
    }

    // Verify the user is an seller
    if (user.privateMetadata.role !== Role.SELLER) {
      return {success: false, message: "Unauthorized Access: Seller privileges required." };
    }

    const store = await db.store.findUnique({where: {id: storeId}});

    if (!store) {
      return {success: false, message: "Store not found" };
    }
    // Verify the store ownership
    if (store.userId !== user.id) {
      return {success: false, message: "You don't have permission for this." };
    }

    // Fetch the order item that is to be updated
    const orderItem = await db.orderItem.findUnique({
      where: {
        id: OrderItemId,
      },
    });

    if (!orderItem) {
      return {success: false, message: "Order item not found" };
    }

    const updatedOrderItem = await db.orderItem.update({
      where: {id: OrderItemId},
      data: {
        status,
      },
    });

    return {success: true, message: "Order status successfully updated.", status: updatedOrderItem.status};
  } catch (error) {
    console.error("Error updating the order status: ", error);
      return {success: false, message: "An unexpected error occurred." };
  }
}