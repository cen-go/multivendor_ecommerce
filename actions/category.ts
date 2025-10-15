"use server"

import db from "@/lib/db";
import { CategoryFormSchema } from "@/lib/schemas";
import { currentUser } from "@clerk/nextjs/server";
import { Category, Role } from "@prisma/client";

// Function: upsertCategory
// Description:  Upserts a category into the database, updating if it exists or creating a new one
// Permission Level: Admin only
// Parameters:
//   - category: category object containing the details of the category to ne upserted
// Returns: Updated or newly created category details.
export async function upsertCategory(category: Partial<Category>) {
  try {
    // Get the current user
    const user = await currentUser()
    if (!user) {
      return { success: false, message: "Unauthenticated!" };
    }

    // Verify the user is an admin
    if (user.privateMetadata.role !== Role.ADMIN) {
      return { success: false, message: "Unauthorized Access: Admin privileges required." };
    }

    // Throw error if a category with the same name or url exists
    const existingCategory = await db.category.findFirst({
      where: {
        AND: [
          { OR: [{ name: category.name }, { url: category.url }] },
          { NOT: { id: category.id } },
        ],
      },
    });

    if (existingCategory) {
      let errorMessage = ""
      if (existingCategory.name === category.name) {
        errorMessage = "A category with the same name already exists.";
      } else if (existingCategory.url === category.url) {
        errorMessage = "A category with the same URL already exists.";
      }
      return { success: false, message: errorMessage };
    }

    // Validate the form data
    const validatedData = CategoryFormSchema.safeParse({
      name: category.name,
      url: category.url,
      image: [{url: category.image}],
      featured: category.featured,
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

    const data = validatedData.data;

    // Update if the category already exist or create a new category
    let categoryDetails;
    if (category.id) {
      // Update
      categoryDetails = await db.category.update({
        where: { id: category.id },
        data: { ...data, image: data.image[0].url },
      });
    } else {
      // Create a new category
      categoryDetails = await db.category.create({
        data: { ...data, image: data.image[0].url },
      });
    }

    return {success: true, category: categoryDetails};

  } catch (error) {
    console.error("error: ", error)
    return {success: false, message: "An unexpected error occurred."};
  }
}

// Function: getAllCategories
// Description: Retrieves all the categories from the database.
// Permission Level: Public
// Returns: An array of categories sorted by updatedAt date in descending order
export async function getAllCategories() {
  const categories = await db.category.findMany({
    include: {subCategories: true},
    orderBy: {updatedAt: "desc"},
  });
  return categories;
}

// Function: getCategoryById
// Description: Retrieves a specific category from the database.
// Permission Level: Public
// Parameters:
//   - categoryId: the ID of the category to be retrieved.
// Returns: Details of the requested category.
export async function getCategoryById(categoryId: string) {
  const category = await db.category.findUnique({where: {id: categoryId}});
  return category;
}

// Function: deleteCategory
// Description: Deletes a specific category from the database.
// Permission Level: Admin only
// Parameters:
//   - categoryId: the ID of the category to be deleted.
// Returns: Respons indicating success of or failure of the delete operation.
export async function deleteCategory(categoryId: string) {
  try {
    // Get the current user
    const user = await currentUser()
    if (!user) {
      return { success: false, message: "Unauthenticated!" };
    }

    // Verify the user is an admin
    if (user.privateMetadata.role !== Role.ADMIN) {
      return { success: false, message: "Unauthorized Access: Admin privileges required." };
    }

    const deletedCategory = await db.category.delete({where: {id: categoryId}});
    return {success: true, deletedCategory};

  } catch (error) {
    console.error("error: ", error)
    return {success: false, message: "An unexpected error occurred." };
  }
}