"use server"

import db from "@/lib/db";
import { SubcategoryFormSchema } from "@/lib/schemas";
import { currentUser } from "@clerk/nextjs/server";
import { SubCategory, Role } from "@prisma/client";

// Function: upsertSubcategory
// Description:  Upserts a subcategory into the database, updating if it exists or creating a new one
// Permission Level: Admin only
// Parameters:
//   - subcategory: subcategory object containing the details of the subcategory to ne upserted
// Returns: Updated or newly created subcategory details.
export async function upsertSubcategory(subcategory: Partial<SubCategory>) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated!");

    // Verify the user is an admin
    if (user.privateMetadata.role !== Role.ADMIN)
      throw new Error("Unauthorized Access: Admin privileges required.");

    // Throw error if a subcategory with the same name or url exists
    const existingSubcategory = await db.subCategory.findFirst({
      where: {
        AND: [
          { OR: [{ name: subcategory.name }, { url: subcategory.url }] },
          { NOT: { id: subcategory.id } },
        ],
      },
    });

    if (existingSubcategory) {
      let errorMessage = ""
      if (existingSubcategory.name === subcategory.name) {
        errorMessage = "A subcategory with the same name already exists.";
      } else if (existingSubcategory.url === subcategory.url) {
        errorMessage = "A subcategory with the same URL already exists.";
      }
      throw new Error(errorMessage);
    }

    // Validate the form data
    const validatedData = SubcategoryFormSchema.safeParse({
      name: subcategory.name,
      url: subcategory.url,
      image: [{url: subcategory.image}],
      featured: subcategory.featured,
      categoryId: subcategory.categoryId,
    });

    if (!validatedData.success) {
      const validationError = validatedData.error.flatten();
      throw new Error(
        `Field errors: ${validationError.fieldErrors.toLocaleString()}, Form errors: ${validationError.formErrors.toLocaleString()}`
      );
    }

    const data = validatedData.data;

    // Update if the subcategory already exist or create a new subcategory
    if (subcategory.id) {
      // Update
      const subcategoryDetails = await db.subCategory.update({
        where: { id: subcategory.id },
        data: { ...data, image: data.image[0].url },
      });
      return subcategoryDetails;
    } else {
      // Create a new subcategory
      const subcategoryDetails = await db.subCategory.create({
        data: { ...data, image: data.image[0].url },
      });
      return subcategoryDetails
    }

  } catch (error) {
    console.error("error: ", error)
    throw error;
  }
}

// Function: getAllSubcategories
// Description: Retrieves all the subcategories from the database.
// Permission Level: Public
// Returns: An array of subcategories sorted by updatedAt date in descending order
export async function getAllSubcategories() {
  const subcategories = await db.subCategory.findMany({
    include: {category: true },
    orderBy: {
      category: {name: "asc"},
    },
  });
  return subcategories;
}

// Function: getSubcategoryById
// Description: Retrieves a specific subcategory from the database.
// Permission Level: Public
// Parameters:
//   - subcategoryId: the ID of the subcategory to be retrieved.
// Returns: Details of the requested subcategory.
export async function getSubcategoryById(subcategoryId: string) {
  const subcategory = await db.subCategory.findUnique({where: {id: subcategoryId}});
  return subcategory;
}

// Function: deleteSubcategory
// Description: Deletes a specific subcategory from the database.
// Permission Level: Admin only
// Parameters:
//   - subcategoryId: the ID of the subcategory to be deleted.
// Returns: Respons indicating success of or failure of the delete operation.
export async function deleteSubcategory(subcategoryId: string) {
  try {
    // Get the current user
    const user = await currentUser()
    if (!user) throw new Error("Unauthenticated!");

    // Verify the user is an admin
    if (user.privateMetadata.role !== Role.ADMIN) {
      throw new Error("Unauthorized Access: Admin privileges required.");
    }

    const response = await db.subCategory.delete({where: {id: subcategoryId}});
    return response
  } catch (error) {
    console.error("error: ", error)
    throw error;
  }
}