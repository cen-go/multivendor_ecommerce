"use server"

import db from "@/lib/db";
import { ApplyCouponFormSchema, CouponFormSchema } from "@/lib/schemas";
import { CartWithCartItemsType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
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
    console.error("Error deleting coupon: ", error);
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

// Function: applyCoupon
// Description: Applies a coupon to a cart for items belonging to the coupon's store.
// Access Level: Public
// Parameters:
//   - couponCode - The coupon code to apply.
//   - cartId - The ID of the cart to apply the coupon to.
// Returns: A message indicating success or failure, along with the updated cart.
export async function applyCoupon(
  couponCode: string,
  cartId: string
): Promise<{
  success: boolean;
  message: string;
  cart?: CartWithCartItemsType;
}> {
  try {
    // Validate the form data coming from the front end
    const validatedFormData = ApplyCouponFormSchema.safeParse({coupon: couponCode});

    if (!validatedFormData.success) {
      console.log(validatedFormData.error.flatten());
      return { success: false, message: "Validation error" };
    }

    // step 1: Get coupon details
    const coupon = await db.coupon.findUnique({
      where: { code: couponCode },
      include: { store: true },
    });

    if (!coupon) {
    return { success: false, message: "Invalid coupon code." };
    }

    // step 2: validate the coupons date range
    const currentDate = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (currentDate < startDate || currentDate > endDate) {
    return { success: false, message: "Coupon has expired or not active yet." };
    }

    // Step 3: Fetch the cart and validate it's existence
    const cart = await db.cart.findUnique({
      where: {id: cartId},
      include: {cartItems: true},
    });

    if (!cart) {
    return { success: false, message: "Cart not found." };
    }

    // Step 4: Ensure no coupon already applied to cart
    if (cart.couponId) {
    return { success: false, message: "A coupon is already applied to this cart." };
  }

  // Step 5: Filter the items from the store associated with the coupon
  const storeItems = cart.cartItems.filter(item => item.storeId === coupon.storeId);

  if (storeItems.length === 0) {
    return {
      success: false,
      message:
        "No items in the cart are available to apply this coupon.",
    };
  }

  // Step 6: Calculate the discount on the stores Products
  const subtotal = storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountedAmount = Math.round(subtotal * coupon.discount / 100);

  // Step 7: Update cart with the applied coupon and the new total
  const updatedCart = await db.cart.update({
    where: {id: cartId},
    data: {
      couponId: coupon.id,
      total: {decrement: discountedAmount},
    },
    include: {cartItems: true, coupon: true},
  });

  return {
    success: true,
    message: `Coupon successfully applied. Discount: ${formatCurrency(
      discountedAmount
    )}`,
    cart: updatedCart,
  };

  } catch (error) {
    console.error("Error applying coupon: ", error);
    return { success: false, message: "An unexpected error occured." };
  }
}