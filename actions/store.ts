"use server";

// Clerk
import { currentUser } from "@clerk/nextjs/server";
// zod schemas
import { StoreFormSchema, StoreShippingFormSchema } from "@/lib/schemas";
// Database client
import db from "@/lib/db";
// Types
import { Role, Store } from "@prisma/client";
import { StoreShippingDetailType } from "@/lib/types";

// Function: upsertStore
// Description:  Upserts a store into the database, ensuring uniqueness of name, email, URL
// Permission Level: Seller only
// Parameters:
//   - storeData: Partial store object containing the details of the store to ne upserted
// Returns: Updated or newly created store details.
export async function upsertStore(storeData: Partial<Store>) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "Unauthenticated!" };
    }

    // Verify the user is an seller
    if (user.privateMetadata.role !== Role.SELLER) {
      return {
        success: false,
        message: "Unauthorized Access: Seller privileges required.",
      };
    }

    // Check for existing store with same name, url, or email (excluding current store)
    const existingStore = await db.store.findFirst({
      where: {
        AND: [
          {
            OR: [
              { name: storeData.name },
              { url: storeData.url },
              { email: storeData.email },
            ],
          },
          { NOT: { id: storeData.id } },
        ],
      },
    });

    if (existingStore) {
      let errorMessage = "";
      if (existingStore.name === storeData.name) {
        errorMessage = "A store with the same name already exists.";
      } else if (existingStore.url === storeData.url) {
        errorMessage = "A store with the same URL already exists.";
      } else if (existingStore.email === storeData.email) {
        errorMessage = "A store with the same email already exists.";
      }
      return { success: false, message: errorMessage };
    }

    // Validate the form data
    const validatedData = StoreFormSchema.safeParse({
      name: storeData.name,
      description: storeData.description,
      email: storeData.email,
      phone: storeData.phone,
      url: storeData.url,
      logo: [{ url: storeData.logo }],
      cover: [{ url: storeData.cover }],
    });

    if (!validatedData.success) {
      const validationError = validatedData.error.flatten();
      return {
        success: false,
        fieldErrors: validationError.fieldErrors,
        formErrors: validationError.formErrors,
        message: "Validation failed.",
      };
    }

    const store = validatedData.data;

    // Update or create store
    let storeDetails;
    if (storeData.id) {
      // Update
      storeDetails = await db.store.update({
        where: { id: storeData.id },
        data: { ...store, logo: store.logo[0].url, cover: store.cover[0].url },
      });
    } else {
      // Create a new store
      storeDetails = await db.store.create({
        data: {
          ...store,
          userId: user.id,
          logo: store.logo[0].url,
          cover: store.cover[0].url,
        },
      });
    }

    return { success: true, store: storeDetails };
  } catch (error) {
    console.error("error: ", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// Function: getStoreByUrl
// Description: Retrieves a specific store from the database.
// Permission Level: Public
// Parameters:
//   - storeUrl: the slug of the store to be retrieved.
// Returns: Details of the requested store.
export async function getStoreByUrl(storeUrl: string) {
  const store = await db.store.findUnique({ where: { url: storeUrl } });
  return store;
}

// Function: getUserStores
// Description: Retrieves from the database all stores of a specific user.
// Permission Level: Public
// Parameters:
//   - userId: the id of the user.
// Returns: An array of the requested stores' details.
export async function getUserStores(userId: string) {
  const userStores = await db.store.findMany({ where: { userId } });

  return userStores;
}

// Function: getStoreDefaultShippingDetails
// Description: Fetches the default shipping details for a store based on the store URL
// Permission Level: Public
// Parameters:
//   - storeUrl: the slug of the store to fetch shipping details.
// Returns: An object containing the shipping details of the store
export async function getStoreDefaultShippingDetails(storeUrl: string) {
  // Feth the store and it's shipping details
  const StoreShippingDetails = await db.store.findUnique({
    where: { url: storeUrl },
    select: {
      returnPolicy: true,
      defaultShippingService: true,
      defaultShippingFeePerItem: true,
      defaultShippingFeePerAdditionalItem: true,
      defaultShippingFeePerKg: true,
      defaultShippingFeeFixed: true,
      defaultDeliveryTimeMin: true,
      defaultDeliveryTimeMax: true,
    },
  });

  return StoreShippingDetails;
}

// Function: updateStoreDefaultShippingDetails
// Description: Updates the shipping details of a store based on store URL and form data
// Permission Level: seller
// Parameters:
//   - storeUrl: the slug of the store to update.
//   - details: An object contining the new shipping details.
// Returns: Updated store object with the new default shipping details.
export async function updateStoreDefaultShippingDetails(
  storeUrl: string,
  details: StoreShippingDetailType
) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "Unauthenticated!" };
    }

    // Verify the user is an seller
    if (user.privateMetadata.role !== Role.SELLER) {
      return {
        success: false,
        message: "Unauthorized Access: Seller privileges required.",
      };
    }

    // Validate the form data
    const validatedData = StoreShippingFormSchema.safeParse(details);

    if (!validatedData.success) {
      const validationError = validatedData.error.flatten();
      return {
        success: false,
        fieldErrors: validationError.fieldErrors,
        formErrors: validationError.formErrors,
        message: "Validation failed.",
      };
    }

    const shippingDetails = validatedData.data;

    // Check if the store exists and it's actually the store of current user
    const existingStore = await db.store.findUnique({
      where: { url: storeUrl },
    });

    if (!existingStore) {
      return { success: false, message: "Store not found." };
    }

    if (existingStore.userId !== user.id) {
      return {
        success: false,
        message:
          "Make sure you have permission to update this store's details.",
      };
    }

    const updatedStore = await db.store.update({
      where: { url: storeUrl },
      data: {
        ...shippingDetails,
        defaultShippingFeePerItem: Math.round(
          shippingDetails.defaultShippingFeePerItem * 100
        ),
        defaultShippingFeePerAdditionalItem: Math.round(
          shippingDetails.defaultShippingFeePerAdditionalItem * 100
        ),
        defaultShippingFeePerKg: Math.round(
          shippingDetails.defaultShippingFeePerKg * 100
        ),
        defaultShippingFeeFixed: Math.round(
          shippingDetails.defaultShippingFeeFixed * 100
        ),
      },
    });

    return {
      success: true,
      message: "Store's shipping details successfully updated.",
      data: updatedStore,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
