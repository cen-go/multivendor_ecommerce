"use server"

// Next.js & React
import { revalidatePath } from "next/cache";
// Clerk
import { currentUser } from "@clerk/nextjs/server";
// Database client
import db from "@/lib/db";
// Types & Prisma types
import { ProductPageDataType, ProductWithVariantType, StoreProductType, VariantImageType, VariantSimplified } from "@/lib/types";
import { Prisma, Role } from "@prisma/client";
// Utils
import slugify from "slugify"
import { generateUniqueSlug, getCloudinaryPublicId } from "@/lib/utils";
// Validation schemas
import { ProductFormSchema } from "@/lib/schemas";
// Cloudinary Functions
import { deleteCloudinaryImage } from "./cloudinary";

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
      return {success: false, message: "Please provide product data."}
    }

    // Check id product already exists
    const existingProduct = await db.product.findUnique({
      where: {id: product.productId ?? ""}
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
          price: Math.round(size.price * 100),
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

// Function: getProducts
// Description: Fetches products based on various filters and
//              returns only variants that match the filters. Supports pagination.
// Permission Level: Public
// Parameters:
//   - Filters: An object containing filter options (category, subcategory, offerTag, size, onSale, onDiscount, brand, color)
//   - sortBy: sort the filtered results (most popular, new arrivals, top rated, price...)
//   - page: the current page number for pagination. (default = 1)
//   - pageSize: the number of products per page (default = 10)
// Returns: An object containing paginated products, filtered variants, and pagination metadata (totalPages, currentPage, pageSize)
export async function getProducts(
  filters: any = {},
  sortBy: string = "",
  page: number = 1,
  pageSize: number = 10
) {
  // Default values related ro pagination
  const currentPage = page;
  const skip = pageSize * (currentPage - 1);

  // Construct the base query
  const whereClause: Prisma.ProductWhereInput = {
    AND: [],
  };

  // Get all filtered and sorted products
  const products = await db.product.findMany({
    where: whereClause,
    orderBy: {},
    skip: skip,
    take: pageSize,
    include: {
      variants: {
        include: {
          sizes: true,
          images: true,
          colors: true,
        },
      },
    },
  });

  // Transform products with filtered variants into ProductCardType structure
  const productsWithFilteredVariants = products.map(product => {
    // filter the variants based on the filters
    const filteredVariants = product.variants;

    // Transform the filtered variants into the VariantSimplified structure
    const variants: VariantSimplified[] = filteredVariants.map((variant) => ({
      variantId: variant.id,
      variantSlug: variant.slug,
      variantName: variant.variantName,
      images: variant.images,
      sizes: variant.sizes,
    }));

    //extract variant images from the product
    const variantImages: VariantImageType[] = filteredVariants.map((variant) => ({
      variantUrl: `/product/${product.slug}/${variant.slug}`,
      imageUrl: variant.variantImage,
    }));

    // Return the product in ProductCardType structure
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      rating: product.rating,
      sales: product.sales,
      variants,
      variantImages,
    }
  });


  // the count of the products matching the filters
  const totalCount = products.length;
  // Calculate the total number of pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Return the products data anad Pagination metadata
  return {
    products: productsWithFilteredVariants,
    totalPages,
    currentPage,
    pageSize,
    totalCount,
  };
}

// Function: getProductPageData
// Description: Fetches details of a specific product variant from the database.
// Permission Level: Public
// Parameters:
//   - ProductSlug: the slug of the product which the variant belongs to
//   - variantSlug: the slug of the variant to be retrşeved
// Returns: Details of the requested product variant.
export async function getProductPageData(ProductSlug: string, variantSlug: string) {
  // Fetch product variant details form the database
  const product = await retrieveProductDetails(ProductSlug, variantSlug);
  return formatProductResponse(product);
}

// Helper functions
async function retrieveProductDetails(
  productSlug: string,
  variantSlug: string
) {
  return await db.product.findUnique({
    where: { slug: productSlug },
    include: {
      category: true,
      subcategory: true,
      specs: true,
      store: true,
      offerTag: true,
      questions: true,
      variants: {
        where: { slug: variantSlug },
        include: {
          images: true,
          colors: true,
          sizes: true,
          specs: true,
        },
      },
    },
  });
}

function formatProductResponse(
  product: Prisma.PromiseReturnType<typeof retrieveProductDetails>
) {
  if (!product) return;
  const variant = product.variants[0];
  const { store } = product;

  return {
    productId: product.id,
    variantId: variant.id,
    productSlug: product.slug,
    variantSlug: variant.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    variantName: variant.variantName,
    variantDescription: variant.variantDescription,
    images: variant.images,
    category: product.category,
    subcategory: product.subcategory,
    offerTag: product.offerTag,
    isSale: variant.isSale,
    saleEndDate: variant.saleEndDate,
    sku: variant.sku,
    colors: variant.colors,
    sizes: variant.sizes,
    specs: {
      productSpecs: product.specs,
      variantSpecs: variant.specs,
    },
    questions: product.questions,
    rating: product.rating,
    reviews: [],
    numReviews: 43,
    reviewStatistics: {
      ratingStatistics: [],
      reviewWithImagesCount: 4,
    },
    shippingDetails: {},
    relatedProducts: [],
    store: {
      id: store.id,
      url: store.url,
      name: store.name,
      logo: store.logo,
      followersCount: 10,
      isUserFollowingStore: true,
    },
  };
}

