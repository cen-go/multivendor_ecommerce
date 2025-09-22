"use server"

import db from "@/lib/db";
import { CouponFormSchema } from "@/lib/schemas";
import { currentUser } from "@clerk/nextjs/server";
import { Coupon, Role } from "@prisma/client";

// Function: upsertCoupon
// Description: Upserts a coupon into the database, updating it if it exists or creating a new one if not.
// Permission Level: Seller only
// Parameters:
//   - coupon: Coupon object containing details of the coupon to be upserted.
//   - storeUrl: String representing the store's unique URL, used to retrieve the store ID.
// Returns: status information and coupon details.
export async function upsertCoupon(coupon: Omit<Coupon, "storeId" | "createdAt" | "updatedAt">, storeUrl: string) {
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
    const store = await db.store.findFirst({
      where: { AND: [{url: storeUrl, }, {userId: user.id}] },
    });
    if (!store) {
      return { success: false, message: "Store not found." };
    }

    // Validate the form data
    const validatedData = CouponFormSchema.safeParse(coupon);

    if (!validatedData.success) {
      const {fieldErrors, formErrors} = validatedData.error.flatten();
      return { success: false, message: "Validation error", fieldErrors, formErrors };
    }

    const couponData = validatedData.data

    // Return an error message if a coupon with the same code exists
    const existingCoupon = await db.coupon.findUnique({where: {code: coupon.code}});
    if (existingCoupon && existingCoupon.id !== coupon.id) {
      return { success: false, message: "A coupon with the same code alread exists. Please try a different Code." };
    }

    // upsert the coupon into the database
    const couponDetails = await db.coupon.upsert({
      where: {id: coupon.id},
      create: {
        ...couponData,
        storeId: store.id,
      },
      update: {
        ...couponData,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `Coupon successfully ${coupon.id ? "updated" : "created"}.`,
      couponDetails,
    };

  } catch (error) {
    console.error("Error upserting coupon: ", error);
    return { success: false, message: "An unexpected error occured." };
  }
}

// Function: getStoreCoupons
// Description: Retrieves all coupons for a specific store based on the provided store URL.
// Permission Level: Seller only
// Parameters:
//   - storeUrl: String representing the store's unique URL, used to retrieve the store ID.
// Returns: Array of coupon details for the specified store.
export async function getStoreCoupons(storeUrl: string): Promise<Coupon[]> {
  // Get the current user
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }
  // Verify the user is an seller
  if (user.privateMetadata.role !== Role.SELLER) {
    throw new Error("Unauthorized Access: Seller privileges required.");
  }

  // Find the store by URL and userId to check if it exists and owned by the current user
  const store = await db.store.findFirst({
    where: { AND: [{ url: storeUrl }, { userId: user.id }] },
  });
  if (!store) {
    throw new Error("Store not found.");
  }

  const storeCoupons = await db.coupon.findMany({
    where: { storeId: store.id },
  });
  return storeCoupons;
}

// Function: deleteCoupon
// Description: Deletes a coupon from the database.
// Permission Level: Seller only (must be the store owner)
// Parameters:
//   - couponId: The ID of the coupon to be deleted.
//   - storeUrl: The URL of the store associated with the coupon.
// Returns: Response indicating success or failure of the deletion operation.
export async function deleteCoupon(couponId:string, storeUrl: string) {
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
    const store = await db.store.findFirst({
      where: { AND: [{url: storeUrl, }, {userId: user.id}] },
    });
    if (!store) {
      return { success: false, message: "Store not found." };
    }

    await db.coupon.delete({where: {id: couponId}});

    return {success: true, message: "Coupon successfully deleted"};
  } catch (error) {
    console.error("Error upserting coupon: ", error);
    return { success: false, message: "An unexpected error occured." };
  }
}

// Function: getCoupon
// Description: Retrieves a specific coupon from the database.
// Access Level: Public
// Parameters:
//   - couponId: The ID of the coupon to be retrieved.
// Returns: Details of the requested coupon.
export async function getCoupon(couponId:string) {
  const coupon = await db.coupon.findUnique({where: {id: couponId}});

  return coupon;
}