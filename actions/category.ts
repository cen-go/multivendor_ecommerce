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
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated!");

    // Verify the user is an admin
    if (user.privateMetadata.role !== Role.ADMIN)
      throw new Error("Unauthorized Access: Admin privileges required.");

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
      throw new Error(errorMessage);
    }

    // Validate the form data
    const data = CategoryFormSchema.parse({
      name: category.name,
      url: category.url,
      image: [{url: category.image}],
      featured: category.featured,
    });

    // Update if the category already exist or create a new category
    if (category.id) {
      // Update
      const categoryDetails = await db.category.update({
        where: { id: category.id },
        data: { ...data, image: data.image[0].url },
      });
      return categoryDetails;
    } else {
      // Create a new category
      const categoryDetails = await db.category.create({
        data: { ...data, image: data.image[0].url },
      });
      return categoryDetails
    }

  } catch (error) {
    console.error("error: ", error)
    throw error;
  }
}