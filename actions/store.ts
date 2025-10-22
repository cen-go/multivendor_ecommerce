"use server";

// Clerk
import { currentUser } from "@clerk/nextjs/server";
// zod schemas
import * as z from "zod";
import { ShippingRateFormSchema, StoreFormSchema, StoreShippingFormSchema } from "@/lib/schemas";
// Database client
import db from "@/lib/db";
// Types
import { Role, Store } from "@prisma/client";
import { StoreShippingDetailType, StoreShippingRateForCountryType } from "@/lib/types";
import { revalidatePath } from "next/cache";

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

    // Check if the store exists and it's actually the owned by current user
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

// Function: getStoreShippingRates
// Description: Retrieves all countries and their shipping rates for a specific store.
//              If a country does not have a shipping rate, it is still included in the result with a null shippingRate.
// Permission Level: Public
// Parameters:
//   - storeUrl: the slug of the store to fetch shipping details.
// Returns: Array of objects where each object contains a country and it's associated shipping rate, sorted by country name.
export async function getStoreShippingRates(storeUrl: string) {
    // get the store details from database, and ensure it exists
    const store = await db.store.findUnique({ where: { url: storeUrl } });
    if (!store) {
      throw new Error("Store not found.");
    }

    const countries = await db.country.findMany({ orderBy: { name: "asc" } });

    const storeShippingRates = await db.shippingRate.findMany({
      where: { storeId: store.id },
    });

    // Create a map for quicek lookup of shipping rates by country Id
    const ratesMap = new Map();
    storeShippingRates.forEach(rate => {
      ratesMap.set(rate.countryId, rate);
    });

    // Map countries to their shipping rates
    const result: StoreShippingRateForCountryType[] = countries.map(country => ({
      countryId: country.id,
      countryName: country.name,
      countryCode: country.code,
      shippingRate: ratesMap.get(country.id) || null,
    }));

    return result;
}

// Function: upsertShippingRate
// Description: Upserts a shipping rate for a specific country, updating if it exists or creating a new one.
// Permission Level: Seller
// Parameters:
//   - storeUrl: Url of the store you are trying to update.
//   - shippingRate: ShippingRate object containing the details of the shipping rate to be upserted.
// Returns: Updated or newly created shipping rate details.
export async function upsertShippingRate(storeUrl:string, shippingRate: z.infer<typeof ShippingRateFormSchema>) {
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
    const validatedData = ShippingRateFormSchema.safeParse(shippingRate);

    if (!validatedData.success) {
      const validationError = validatedData.error.flatten();
      return {
        success: false,
        fieldErrors: validationError.fieldErrors,
        formErrors: validationError.formErrors,
        message: "Validation failed.",
      };
    }

    const shippingRateData = validatedData.data;

    // Check if the store exists and it's actually the owned by current user
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

    // Prepare data to be upserted into database
    const data = {
      shippingService: shippingRateData.shippingService,
      returnPolicy: shippingRateData.returnPolicy,
      shippingFeePerItem: Math.round(shippingRateData.shippingFeePerItem * 100),
      shippingFeePerAdditionalItem: Math.round(
        shippingRateData.shippingFeePerAdditionalItem * 100
      ),
      shippingFeePerKg: Math.round(shippingRateData.shippingFeePerKg * 100),
      shippingFeeFixed: Math.round(shippingRateData.shippingFeeFixed * 100),
      deliveryTimeMin: shippingRateData.deliveryTimeMin,
      deliveryTimeMax: shippingRateData.deliveryTimeMax,
    };

    // update or create in database with Prisma's upsert method
    const shippingRateResult = await db.shippingRate.upsert({
      where: {
        storeId_countryId: {
          storeId: existingStore.id,
          countryId: shippingRateData.countryId,
        },
      },
      update: data,
      create: {
        ...data,
        storeId: existingStore.id,
        countryId: shippingRateData.countryId,
      },
    });

    revalidatePath(`/dashboard/seller/stores/${storeUrl}/shipping`);

    return {
      success: true,
      message: `Shipping rates for ${shippingRateData.countryName} successfully updated.`,
      data: shippingRateResult,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

// Function: getStoreOrders
// Description: Fetches all orders for a specific store
// Permission Level: Seller
// Parameters:
//   - storeUrl: Url of the store whose orders are going to be fetched.
// Returns: Array of order groups including order details and items.
export async function getStoreOrders(storeUrl: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthenticated!");
    }

    // Verify the user is an seller
    if (user.privateMetadata.role !== Role.SELLER) {
      throw new Error("Unauthorized Access: Seller privileges required.");
    }

    const store = await db.store.findUnique({where: {url: storeUrl}});

    if (!store) {
      throw new Error("Store not found");
    }
    // Verify the store ownership
    if (store.userId !== user.id) {
      throw new Error("You don't have permission to view orders of this store.");
    }

    const orders = await db.orderGroup.findMany({
      where: { storeId: store.id },
      include: {
        orderItems: true,
        coupon: true,
        order: {
          select: {
            paymentStatus: true,
            paymentDetails: true,
            shippingAddress: { include: { country: true } },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {updatedAt: "desc"},
    });

    return orders;
  } catch (error) {
    console.error("Error fetching store orders: ", error);
    throw new Error("Somethin went wrong while fetching the store orders.");
  }
}