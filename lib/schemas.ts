import { StoreStatus } from "@prisma/client";
import * as z from "zod";

// Helper function to define string requirement
const requiredString = (field: string) =>
  z.string({
    required_error: `${field} is required.`,
    invalid_type_error: `${field} must be a valid string.`,
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

// Product Form Schema
export const ProductFormSchema = z.object({
  name: requiredString("Product name")
    .min(2, { message: "Product name should be at least 2 characters long." })
    .max(200, { message: "Product name cannot exceed 200 characters." })
    .regex(
      /^(?!.*(?:[-_ ?:,!']){2,})[^- \s_,.'][\p{L}0-9\s'&-_!?:+,.']*[^- \s_,']$/u,
      {
        message:
          "Only letters, numbers, space, ?, :, !, +, -, ', _, period and comma are allowed in the product name, and consecutive occurrences of spaces and special characters are not permitted.",
      }
    ),
  description: requiredString("Product description").min(100, {
    message: "Product description should be at least 100 characters long.",
  }),
  variantName: requiredString("Product variant name")
    .min(2, {
      message: "Product variant name should be at least 2 characters long.",
    })
    .max(100, { message: "Product variant name cannot exceed 100 characters." })
    .regex(
      /^(?!.*(?:[-_ ?:,!']){2,})[^- \s_,.'][\p{L}0-9\s'&-_!?:+,.']*[^- \s_,']$/u,
      {
        message:
          "Only letters, numbers, space, ?, :, !, +, -, ', _, period and comma are allowed in the product variant name, and consecutive occurrences of spaces and special characters are not permitted.",
      }
    ),
  variantDescription: z.string(),
  images: z
    .object({ url: z.string() })
    .array()
    .min(2, "Please provide at least 2 images for the product")
    .max(6, "You can upload up to 6 images for the product"),
  variantImage: z
    .object({ url: z.string() })
    .array()
    .length(1, "Choose a product variant image."),
  categoryId: z
    .string({
      required_error: "Product category is mandatory.",
      invalid_type_error: "Product category ID must be a valid UUID.",
    })
    .uuid({message: "Invalid category."}),
  subcategoryId: z
    .string({
      required_error: "Product subcategory is mandatory.",
      invalid_type_error: "Product subcategory ID must be a valid UUID.",
    })
    .uuid({message: "Invalid subcategory."}),
  brand: requiredString("Product brand")
    .min(2, {
      message: "Product brand should be at least 2 characters long.",
    })
    .max(50, {
      message: "Product brand cannot exceed 50 characters.",
    }),
  sku: requiredString("Product SKU")
    .min(6, {
      message: "Product SKU should be at least 6 characters long.",
    })
    .max(50, {
      message: "Product SKU cannot exceed 50 characters.",
    }),
  keywords: requiredString("Product keywords")
    .array()
    .min(3, {
      message: "Please provide at least 5 keywords.",
    })
    .max(10, {
      message: "You can provide up to 10 keywords.",
    }),
  colors: z
    .object({ color: z.string() })
    .array()
    .min(1, "Please provide at least one color.")
    .refine((colors) => colors.every((c) => c.color.length > 0), {
      message: "All color inputs must be filled.",
    }),
  sizes: z
    .object({
      size: z.string(),
      quantity: z
        .number()
        .min(1, { message: "Quantity must be greater than 0." }),
      price: z
        .number()
        .min(0.01, "Pricce must be greater than 0.")
        .refine((price) => Number.isInteger(price * 100), {
          message: "Price can have at most two decimal places.",
        }),
      discount: z.number().min(0),
    })
    .array()
    .min(1, "Please provide at least one size")
    .refine(
      (sizes) =>
        sizes.every((s) => s.size.length > 0 && s.price > 0 && s.quantity > 0),
      { message: "All size inputs must be filled correctly." }
    )
    .refine((sizes) => sizes.every((s) => Number.isInteger(s.price * 100)), {
      message: "Price can have at most two decimal places.",
    }),
  product_specs: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .array()
    .min(1, "Please provide at least one product spec.")
    .refine(
      (product_specs) =>
        product_specs.every((s) => s.name.length > 0 && s.value.length > 0),
      { message: "All product specs inputs must be filled correctly." }
    ),
    variant_specs: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .array()
    .min(1, "Please provide at least one product variant spec.")
    .refine(
      (variant_specs) =>
        variant_specs.every((s) => s.name.length > 0 && s.value.length > 0),
      {
        message: "All product variant specs inputs must be filled correctly.",
      }
    ),
    questions: z
    .object({
      question: z.string(),
      answer: z.string(),
    })
    .array()
    .optional(),
  isSale: z.boolean(),
  saleEndDate: z.string().optional(),
});

export const OfferTagFormSchema = z.object({
  name: requiredString("Offer Tag name")
    .min(2, { message: "Tag name must be at least 2 characters long." })
    .max(50, { message: "Tag name cannot exceed 50 characters." })
    .regex(
      /^(?!.*(?:[-_ ?:,!']){2,})[^- \s_,.'][\p{L}0-9\s'&-_!?:+,.']*[^- \s_,']$/u,
      {
        message:
          "Only letters, numbers, space, ?, :, !, +, -, ', _, period and comma are allowed in the tag name, and consecutive occurrences of spaces and special characters are not permitted.",
      }
    ),
  url: requiredString("Offer Tag URL")
    .min(2, { message: "Category url must be at least 2 characters long." })
    .max(50, { message: "Category url cannot exceed 50 characters." })
    .regex(/^(?!.*(?:[-_ ]){2,})[a-zA-Z0-9_-]+$/, {
      message:
        "Only letters, numbers, hyphen, and underscore are allowed in Offer Tag URL, and consecutive occurrences of hyphens, underscores, or spaces are not permitted.",
    }),
});

// Store shippind details form schema
export const StoreShippingFormSchema = z.object({
  returnPolicy: requiredString("Return policy").min(20, {
    message: "Return policy must be at least 20 characters long.",
  }),
  defaultShippingService: requiredString("Default shipping service")
    .min(2, {
      message: "Shipping service name must be at least 2 characters long.",
    })
    .max(50, { message: "Shipping service name cannot exceed 50 characters." }),
  defaultShippingFeePerItem: z
    .number()
    .min(0, "Pricce must be greater than 0.")
    .refine((price) => Number.isInteger(price * 100), {
      message: "Price can have at most two decimal places.",
    }),
  defaultShippingFeePerAdditionalItem: z
    .number()
    .min(0, "Pricce must be greater than 0.")
    .refine((price) => Number.isInteger(price * 100), {
      message: "Price can have at most two decimal places.",
    }),
  defaultShippingFeePerKg: z
    .number()
    .min(0, "Pricce must be greater than 0.")
    .refine((price) => Number.isInteger(price * 100), {
      message: "Price can have at most two decimal places.",
    }),
  defaultShippingFeeFixed: z
    .number()
    .min(0, "Pricce must be greater than 0.")
    .refine((price) => Number.isInteger(price * 100), {
      message: "Price can have at most two decimal places.",
    }),
  defaultDeliveryTimeMin: z.number(),
  defaultDeliveryTimeMax: z.number(),
});