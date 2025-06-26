"use server"

import db from "@/lib/db";
import { ProductWithVariantType, StoreProductType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import slugify from "slugify"
import { generateUniqueSlug, getCloudinaryPublicId } from "@/lib/utils";
import { ProductFormSchema } from "@/lib/schemas";
import { deleteCloudinaryImage } from "./cloudinary";
import { revalidatePath } from "next/cache";

// Function: upsertProduct
// Description:  Upserts a product and it's variant into the database,
//               ensuring it's proper association to the store.
// Permission Level: Seller only
// Parameters:
//   - product: Product with variant object containing details of the product
//   - storeUrl: URL of the store to whitch the product belongs to
// Returns: Newly created or updated product with variant details.
export async function upsertProduct(
  product: ProductWithVariantType,
  storeUrl: string
) {
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
    // Ensure product data is provided
    if (!product) {
      return {success: false, message: "Please privide product data."}
    }

    // Check id product already exists
    const existingProduct = await db.product.findFirst({
      where: {id: product.productId}
    });

    // Find the store by URL
    const store = await db.store.findUnique({where: {url: storeUrl}});
    if (!store) {
      return { success: false, message: "Store not found." };
    }

    // Validate the form data at backend
    const validatedData = ProductFormSchema.safeParse({
      ...product,
      variantImage: [{url: product.variantImage}],
    });
    if (!validatedData.success) {
      const validationErrors = validatedData.error.flatten();
      return {
        success: false,
        fieldErrors: validationErrors.fieldErrors,
        formErrors: validationErrors.formErrors,
        message: "Validation failed"
      };
    }

    // Generate unique slugs for the product and the variant
    const baseProductSlug = slugify(product.name, {lower: true, trim: true, replacement: "-"});
    // Use the util fn we created to make sure the slug is unique
    const productSlug = await generateUniqueSlug(baseProductSlug, "product",)

    const baseVariantSlug = slugify(product.variantName, {lower: true, trim: true, replacement: "-"});
    const variantSlug = await generateUniqueSlug(baseVariantSlug, "productVariant",);

    // Common data for the product and variant
    const commonProductData = {
      name: product.name,
      description: product.description,
      slug: productSlug,
      brand: product.brand,
      store: {connect: {id: store.id}},
      category: {connect: {id: product.categoryId}},
      subcategory: {connect: {id: product.subcategoryId}},
      specs: {
        create: product.product_specs.map(spec => ({
          name: spec.name,
          value: spec.value,
        }))
      },
      questions: {
        create: product.questions?.map(q => ({
          question: q.question,
          answer: q.answer,
        }))
      }
    };

    const commonVariantData = {
      variantName: product.variantName,
      variantDescription: product.variantDescription,
      variantImage: product.variantImage,
      slug: variantSlug,
      isSale: product.isSale,
      saleEndDate: product.isSale ? product.saleEndDate : null,
      sku: product.sku,
      keywords: product.keywords.join(","),
      images: {
        create: product.images.map((image) => ({
          url: image.url,
          alt: image.url.split("/").pop() ?? "",
        })),
      },
      colors: {
        create: product.colors.map(color => ({
          name: color.color,
        })),
      },
      sizes: {
        create: product.sizes.map(size => ({
          size: size.size,
          quantity: size.quantity,
          price: size.price * 100,
          discount: size.discount,
        })),
      },
      specs: {
        create: product.variant_specs.map(spec => ({
          name: spec.name,
          value: spec.value,
        }))
      },
    };

    // If product exists create a variant
    if (existingProduct) {
      const variantData = {
        ...commonVariantData,
        product: {connect: {id: existingProduct.id}},
      }

      const variantCreated = await db.productVariant.create({
        data: variantData,
      });

      return {success: true, message: "Product variant created.", data: variantCreated};
    } else {
      // Otherwise create a new product with variant
      const productData = {
        ...commonProductData,
        variants: {
          create: [{
            ...commonVariantData
          }]
        },
      }
      const productCreated = await db.product.create({
        data: productData
      });

      return {success: true, message: "Product created", data: productCreated}
    }

  } catch (error) {
    console.error(error);
    return {success: false, message: "An unexpected error occured."};
  }
}

// Function: getProductMainInfo
// Description:  Retrieves the main information of a specific product from the database
// Permission Level: Public
// Parameters:
//   - productId: the ID of the requested product
// Returns: An object containing main information of the product or null if the product doesn't exist
export async function getProductMainInfo(productId: string) {
  // Retrieve the product from the database
  const product = await db.product.findUnique({where: {id: productId}});
  if (!product) return null;

  // Return the main information of the product
  return {
    productId: product.id,
    name: product.name,
    description: product.description,
    brand: product.brand,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    storeId: product.storeId,
  };
}

// Function: getAllStoreProducts
// Description:  Retrieves all products from a specific store
// Permission Level: Public
// Parameters:
//   - storeUrl: the URL of the store whose products are to be retrieved
// Returns: An array of products from the requested store including category, subcategory and varint details
export async function getAllStoreProducts(storeUrl: string) {
  // retrieve store details from the database
  const store = await db.store.findUnique({where: {url: storeUrl}});

  if (!store) {
    throw new Error("Please provide a valid store URL.");
  }

  // Retrieve all the products associated with the store
  const products = await db.product.findMany({
    where: {storeId: store.id},
    include: {
      category: true,
      subcategory: true,
      variants: {
        include: {
          images: true,
          colors: true,
          sizes: true,
        }
      },
      store: {
        select: {
          id: true,
          url: true,
        }
      },
    },
  });

  return products;
}

// Function: deleteProduct
// Description:  deletes a product from the database
// Permission Level: Seller only
// Parameters:
//   - productId: the ID of the product to be deleted
// Returns: Response indicating the success or failure of the operation
export async function deleteProduct(product: StoreProductType) {
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

    // Gather all image URLs from all variants
    const imageUrls = product.variants.flatMap((variant) =>
      variant.images.map((image) => image.url)
    );

    // Delete all images from Cloudinary in parallel
    // for deleting larger batches (hundreds of images) consider sequential delete with for...of loop
    const deleteResults = await Promise.all(
      imageUrls.map(async (url:string) => {
        const publicId = getCloudinaryPublicId(url);
        return await deleteCloudinaryImage(publicId);
      })
    );

    // Check for any failed deletions
    // Ignore "not found" errors from Cloudinary, only fail on real errors
    const failed = deleteResults.find(r => !r.success && r.message !== "not found")
    if (failed) {
      return { success: false, message: `Failed to delete some images: ${failed.message}` };
    }

    // delete the product from the database
    const deletedProduct = await db.product.delete({where: {id: product.id}});

    revalidatePath(`/dashboard/seller/stores/${product.store.url}/products`);
    return {success: true, deletedProduct};
  } catch (error) {
    console.error(error);
    return {success: false, message: "An unexpected error occured."};
  }
}