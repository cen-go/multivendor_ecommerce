"use server"

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Coupon, Role } from "@prisma/client";

// Function: upsertCoupon
// Description: Upserts a coupon into the database, updating it if it exists or creating a new one if not.
// Permission Level: Seller only
// Parameters:
//   - coupon: Coupon object containing details of the coupon to be upserted.
//   - storeUrl: String representing the store's unique URL, used to retrieve the store ID.
// Returns: status information and coupon details.
export async function upsertCoupon(coupon: Coupon, storeUrl: string) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "Not authenticated." };
    }
    // Verify the user is an seller
    if (user.privateMetadata.role !== Role.SELLER) {
      return {
        success: false,
        message: "Unauthorized Access: Seller privileges required.",
      };
    }

    // Find the store by URL and userId to check if it exists and owned by the current user
    const store = await db.store.findUnique({
      where: { url: storeUrl, userId: user.id },
    });
    if (!store) {
      return { success: false, message: "Store not found." };
    }
  } catch (error) {
    console.error("Error upserting coupon: ", error);
    return { success: false, message: "An unexpected error occured." };
  }
}