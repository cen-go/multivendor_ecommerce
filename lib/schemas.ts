import { StoreStatus } from "@prisma/client";
import * as z from "zod";

// Helper function to define string requirement
const requiredString = (field: string) =>
  z.string({
    required_error: `${field} is required.`,
    invalid_type_error: `${field} must be a string.`,
  });

// Catgeory form schema
export const CategoryFormSchema = z.object({
  name: requiredString("Category name")
    .min(2, { message: "Category name must be at least 2 characters long." })
    .max(50, { message: "Category name cannot exceed 50 characters." })
    .regex(/^[\p{L}0-9\s'&-]+$/u, {
      message:
        "Only letters, numbers, and spaces are allowed in the category name.",
    }),
  image: z
    .object({
      url: z.string(),
    })
    .array()
    .length(1, "Choose a category image."),
  url: requiredString("Category url")
    .min(2, { message: "Category url must be at least 2 characters long." })
    .max(50, { message: "Category url cannot exceed 50 characters." })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
      message:
        "Only letters, numbers, hyphen, and underscore are allowed in the category url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
    }),
  featured: z.boolean(),
});

// Subcatgeory form schema
export const SubcategoryFormSchema = z.object({
  name: requiredString("Subcategory name")
    .min(2, { message: "Subcategory name must be at least 2 characters long." })
    .max(50, { message: "Subcategory name cannot exceed 50 characters." })
    .regex(/^[\p{L}0-9\s'&-]+$/u, {
      message:
        "Only letters, numbers, and spaces are allowed in the subcategory name.",
    }),
  image: z
    .object({
      url: z.string(),
    })
    .array()
    .length(1, "Choose a subcategory image."),
  url: requiredString("Subcategory url")
    .min(2, { message: "Subcategory url must be at least 2 characters long." })
    .max(50, { message: "Subcategory url cannot exceed 50 characters." })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
      message:
        "Only letters, numbers, hyphen, and underscore are allowed in the subcategory url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
    }),
  featured: z.boolean(),
  categoryId: z.string().uuid(),
});

// Store form schema
export const StoreFormSchema = z.object({
  name: requiredString("Store name")
    .min(2, { message: "Store name must be at least 2 characters long." })
    .max(50, { message: "Store name cannot exceed 50 characters." })
    .regex(/^(?!.*(?:[-_ ?:]){2,})[^-\s_][\p{L}0-9\s'&-_!?:+]*[^-\s_]$/u, {
      message:
        "Only letters, numbers, space, ?, :, !, +, -, and _ are allowed in the store name, and consecutive occurrences of spaces, ?, :, !, +, -, or _ are not permitted.",
    }),
  description: requiredString("Store description")
    .min(20, {
      message: "Store description must be at least 20 characters long.",
    })
    .max(500, { message: "Store description cannot exceed 500 characters." }),
  email: requiredString("Email").email({
    message: "Please enter a valid email",
  }),
  phone: requiredString("Store phone number").regex(/^\+?\d+$/, {
    message: "Invalid phone number format.",
  }),
  url: requiredString("Store url")
    .min(2, { message: "Store url must be at least 2 characters long." })
    .max(50, { message: "Store url cannot exceed 50 characters." })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
      message:
        "Only letters, numbers, hyphen, and underscore are allowed in the store url, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
    }),
  logo: z.object({ url: z.string() }).array().length(1, "Choose a logo image"),
  cover: z
    .object({ url: z.string() })
    .array()
    .length(1, "Choose a cover image"),
  featured: z.boolean().optional(),
  status: z.enum(
    [
      StoreStatus.ACTIVE,
        StoreStatus.BANNED,
        StoreStatus.DISABLED,
        StoreStatus.PENDING,
    ],
    { message: "Please select a valid store status" }
  ).optional(),
});
