"use server"

import db from "@/lib/db";
import { StoreFormSchema } from "@/lib/schemas";
import { currentUser } from "@clerk/nextjs/server";
import { Role, Store } from "@prisma/client";

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
      return { success: false, message: "Unauthorized Access: Seller privileges required." };
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
      logo: [{url: storeData.logo}],
      cover: [{url: storeData.cover}],
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
        data: { ...store, logo: store.logo[0].url, cover: store.cover[0].url, },
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
    console.error("error: ", error)
    return { success: false, message: "An unexpected error occurred." };
  }
}