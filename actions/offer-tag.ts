"use server"

import db from "@/lib/db";
import { OfferTagFormSchema } from "@/lib/schemas";
import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";

// Function: upsertOfferTag
// Description: Upserts an offer tag into the database, updating if it exists or creating a new one if not.
// Permission Level: Admin only
// Parameters:
//   - offerTag: OfferTag object containing details of the offer tag to be upserted.
// Returns: Updated or newly created offer tag details.
export async function upsertOfferTag({
  id,
  name,
  url,
}: {
  id?: string;
  name: string;
  url: string;
}) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "Unauthenticated!" };
    }

    // Verify the user is an admin
    if (user.privateMetadata.role !== Role.ADMIN) {
      return {
        success: false,
        message: "Unauthorized Access: Admin privileges required.",
      };
    }

    // Validate the form data
    const offerTagData = OfferTagFormSchema.safeParse({name, url});

    if (!offerTagData.success) {
      const validationErrors = offerTagData.error.flatten();
      return {
        success: false,
        fieldErrors: validationErrors.fieldErrors,
        formErrors: validationErrors.formErrors,
        message: "Validation failed."
      };
    }

    const offerTag = offerTagData.data

    // Throw error if offer tag with the same URL already exists
    const existingOfferTag = await db.offerTag.findFirst({ where: { url } });
    if (existingOfferTag) {
      return {
        success: false,
        message: "An offer tag with the same URL already exists",
      };
    }

    let offerTagDetails;
    if (id) {
      // Update an existing offer tag if ID provided
      offerTagDetails = await db.offerTag.update({
        where: {id},
        data: offerTag,
      });
    } else {
      offerTagDetails = await db.offerTag.create({data: offerTag});
    }
    return {success: true, message: "Offer tag created.", data: offerTagDetails}

  } catch (error) {
    console.error("error: ", error)
    return { success: false, message: "An unexpected error occurred." };
  }
}

// Function: getAllOfferTags
// Description: Retrieves all offer tags from the database.
// Permission Level: Public
// Returns: Array of offer tags sorted by updatedAt date in ascending order.
export const getAllOfferTags = async (storeUrl?: string) => {
  let storeId: string | undefined;

  if (storeUrl) {
    // Retrieve the storeId based on the storeUrl
    const store = await db.store.findUnique({
      where: { url: storeUrl },
    });

    // If no store is found, return an empty array or handle as needed
    if (!store) {
      return [];
    }

    storeId = store.id;
  }

  // Retrieve all offer tags from the database
  const offerTgas = await db.offerTag.findMany({
    where: storeId
      ? {
          products: {
            some: {
              storeId: storeId,
            },
          },
        }
      : {},
    include: {
      products: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      products: {
        _count: "desc", // Order by the count of associated products in descending order
      },
    },
  });
  return offerTgas;
};

// Function: getOfferTag
// Description: Retrieves a specific OfferTag from the database.
// Access Level: Public
// Parameters:
//   - offerTagId: The ID of the OfferTag to be retrieved.
// Returns: Details of the requested OfferTag.
export const getOfferTag = async (offerTagId: string) => {
  // Retrieve the offer tag from the database using the provided ID
  const offerTag = await db.offerTag.findUnique({
    where: {
      id: offerTagId,
    },
  });

  // Return the retrieved offer tag details
  return offerTag;
};

// Function: deleteOfferTag
// Description: Deletes an offer tag from the database by its ID.
// Permission Level: Admin only
// Parameters:
//   - offerTagId: The ID of the offer tag to be deleted.
// Returns: A success message if the offer tag is deleted, or an error if it fails.
export const deleteOfferTag = async (offerTagId: string) => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) {
      return { success: false, message: "Unauthenticated." };
    }

    // Verify admin permission
    if (user.privateMetadata.role !== Role.ADMIN) {
      return {
        success: false,
        message: "Unauthorized Access: Admin privileges required.",
      };
    };

    // Ensure the offerTagId is provided
    if (!offerTagId) {
      return { success: false, message: "Please provide the offer tag ID." };
    }

    // Delete offer tag from the database
    const response = await db.offerTag.delete({
      where: {
        id: offerTagId,
      },
    });
    return {success: true, message: "Offer tag successfully deleted", response, };

  } catch (error) {
    console.error("error: ", error)
    return { success: false, message: "An unexpected error occurred." };
  }
};