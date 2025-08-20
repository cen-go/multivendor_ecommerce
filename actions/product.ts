"use server"

// Next.js & React
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
// Clerk
import { currentUser } from "@clerk/nextjs/server";
// Database client
import db from "@/lib/db";
// Types & Prisma types
import {
  CountriesWithFreeShippingType,
  ProductQueryFiltersType,
  ProductShippingDetailsType,
  ProductWithVariantType,
  RatingStatisticsType,
  StoreProductType,
  UserCountry,
  VariantImageType,
  VariantSimplified,
} from "@/lib/types";
import { Prisma, Role, ShippingFeeMethod, Store } from "@prisma/client";
// Utils
import slugify from "slugify"
import { generateUniqueSlug, getCloudinaryPublicId } from "@/lib/utils";
// Validation schemas
import { ProductFormSchema } from "@/lib/schemas";
// Cloudinary Functions
import { deleteCloudinaryImage } from "./cloudinary";
// Constants
import { DEFAULT_REVIEWS_PAGE_SIZE } from "@/lib/constants";

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

    // Find the store by URL and userId to check if it exists and owned by the current user
    const store = await db.store.findUnique({where: {url: storeUrl, userId: user.id}});
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

    // Check if product already exists
    const existingProduct = await db.product.findUnique({
      where: {id: product.productId ?? ""}
    });

    // Check if product already exists
    const existingVariant = await db.productVariant.findUnique({
      where: {id: product.variantId ?? ""}
    });

    // Generate unique slugs for the product and the variant
    const baseProductSlug = slugify(product.name, {lower: true, trim: true, replacement: "-"});
    // Use the util fn we created to make sure the slug is unique
    const productSlug = await generateUniqueSlug(baseProductSlug, "product",)

    const baseVariantSlug = slugify(product.variantName, {lower: true, trim: true, replacement: "-"});
    const variantSlug = await generateUniqueSlug(baseVariantSlug, "productVariant",);

    // Common data for the product and variant
    const commonProductData: Prisma.ProductCreateInput = {
      name: product.name,
      description: product.description,
      slug: productSlug,
      brand: product.brand,
      store: { connect: { id: store.id } },
      category: { connect: { id: product.categoryId } },
      subcategory: { connect: { id: product.subcategoryId } },
      specs: {
        create: product.product_specs.map((spec) => ({
          name: spec.name,
          value: spec.value,
        })),
      },
      questions: {
        create: product.questions?.map((q) => ({
          question: q.question,
          answer: q.answer,
        })),
      },
      shippingFeeMethod: product.shippingFeeMethod,
      freeShippingForAllCountries: product.freeShippingForAllCountries,
      freeShipping: product.freeShippingForAllCountries
        ? undefined
        : product.freeShippingCountriesIds &&
          product.freeShippingCountriesIds.length > 0
        ? {
            create: {
              eligibleCountries: {
                create: product.freeShippingCountriesIds.map((c) => ({
                  country: { connect: { id: c.value } },
                })),
              },
            },
          }
        : undefined,
    };

    const commonVariantData = {
      variantName: product.variantName,
      variantDescription: product.variantDescription,
      variantImage: product.variantImage,
      slug: variantSlug,
      isSale: product.isSale,
      saleEndDate: product.isSale ? product.saleEndDate : null,
      sku: product.sku,
      weight: product.weight,
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

    if (existingProduct) {
      if (existingVariant) {
        // update existing variant and product
      return {success: true, message: `Product named -${product.name}- has created`};
      } else {
        // Create a new variant
      return {success: true, message: `Product named -${product.name}- has created`};
      }
    } else {
      // Create a new product and it's variant
      const newProduct = await db.product.create({
        data: {
          ...commonProductData,
          variants: {
            create: [{
              ...commonVariantData
            }],
          },
        },
      });

      return {success: true, message: `Product named -${product.name}- has created`, data: newProduct};
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

  const plainProducts = products.map(product => ({
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        weight: variant.weight ? variant.weight.toNumber() : null,
      })),
    }))

  return plainProducts;
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
  filters: ProductQueryFiltersType = {},
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

  // Apply category filter using category URL
  if (filters.category) {
    const category = await db.category.findUnique({
      where: { url: filters.category },
      select: {id: true},
    });
    if (category) {
      (whereClause.AND as Prisma.ProductWhereInput[]).push({categoryId: category.id});
    }
  }

  // Apply subcategory filter using category URL
  if (filters.subcategory) {
    const subcategory = await db.subCategory.findUnique({
      where: { url: filters.subcategory },
      select: {id: true},
    });
    if (subcategory) {
      (whereClause.AND as Prisma.ProductWhereInput[]).push({subcategoryId: subcategory.id});
    }
  }

  // Apply Store filter using store URL
  if (filters.storeUrl) {
    const store = await db.store.findUnique({
      where: { url: filters.storeUrl },
      select: {id: true},
    });
    if (store) {
      (whereClause.AND as Prisma.ProductWhereInput[]).push({storeId: store.id});
    }
  }

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
  // Get current user
  const user = await currentUser();
  // Fetch product variant details form the database
  const product = await retrieveProductDetails(ProductSlug, variantSlug);
  if (!product) return null;

  const userCountry = await getUserCountry();

  // Calculate and retrieve the shipping details
  const productShippingDetails = await getShippingDetails(
    product.shippingFeeMethod,
    userCountry,
    product.store,
    product.freeShipping
  );

  // get store followers count
  const storeFollowersCount = await getStoreFollowersCount(product.storeId);

  // Check if user is following the store
  const isUserFollowingStore = await checkIfUserFollowingStore(product.storeId, user?.id)

  const ratingStatistics = await getRatingStatistics(product.id)

  return formatProductResponse(
    product,
    productShippingDetails,
    storeFollowersCount,
    isUserFollowingStore,
    ratingStatistics
  );
}

// Helper functions
async function retrieveProductDetails(
  productSlug: string,
  variantSlug: string
) {
  const product = await db.product.findUnique({
    where: { slug: productSlug },
    include: {
      category: true,
      subcategory: true,
      specs: true,
      store: true,
      offerTag: true,
      questions: true,
      reviews: {
        include: { images: true, user: true },
        take: DEFAULT_REVIEWS_PAGE_SIZE,
        orderBy: {createdAt: "desc"},
      },
      variants: {
        where: { slug: variantSlug },
        include: {
          images: true,
          colors: true,
          sizes: true,
          specs: true,
        },
      },
      freeShipping: {
        include: {
          eligibleCountries: true,
        },
      },
    },
  });

  if (!product) return null;

  // Get variant Images
  const variantsInfo = await db.productVariant.findMany({
    where: { productId: product.id },
    select: {
      variantImage: true,
      slug: true,
      variantName: true,
      sizes: true,
      colors: true,
    },
  });

  return {
    ... product,
    variantsInfo: variantsInfo.map(variant => ({
      variantUrl: `/product/${product.slug}/${variant.slug}`,
      image: variant.variantImage,
      variantSlug: variant.slug,
      variantName: variant.variantName,
      sizes: variant.sizes,
      colors: variant.colors,
    }))
  };
}

function formatProductResponse(
  product: Prisma.PromiseReturnType<typeof retrieveProductDetails>,
  shippingDetails: ProductShippingDetailsType,
  storeFollowersCount: number | undefined,
  isUserFollowingStore: boolean,
  ratingStatistics: RatingStatisticsType,
) {
  if (!product || product.variants.length === 0) return;
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
    variantImage: variant.variantImage,
    category: product.category,
    subcategory: product.subcategory,
    offerTag: product.offerTag,
    isSale: variant.isSale,
    saleEndDate: variant.saleEndDate,
    sku: variant.sku,
    weight: variant.weight ? variant.weight.toNumber() : null,
    colors: variant.colors,
    sizes: variant.sizes,
    specs: {
      productSpecs: product.specs,
      variantSpecs: variant.specs,
    },
    questions: product.questions,
    rating: product.rating,
    reviews: product.reviews,
    reviewStatistics: ratingStatistics,
    shippingDetails: shippingDetails,
    relatedProducts: [],
    variantsInfo: product.variantsInfo,
    store: {
      id: store.id,
      url: store.url,
      name: store.name,
      logo: store.logo,
      followersCount: storeFollowersCount ?? 0,
      isUserFollowingStore: isUserFollowingStore,
    },
  };
}

async function getStoreFollowersCount(storeId: string) {
  const storeFollowersCount = await db.store.findUnique({
    where: { id: storeId },
    select: {
      _count: {
        select: { followers: true },
      },
    },
  });

  return storeFollowersCount?._count.followers;
}

export async function checkIfUserFollowingStore(storeId: string, userId: string | undefined) {
  let isUserFollowing = false;
  if (userId) {
    const storeFollowerCheck = await db.store.findUnique({
      where: { id: storeId },
      select: {
        followers: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    if (storeFollowerCheck && storeFollowerCheck.followers.length > 0) {
      isUserFollowing = true;
    }
  }
  return isUserFollowing;
}

async function getUserCountry() {
  const cookieStore = await cookies();
  const userCountryCookie = cookieStore.get("userCountry");

  const defaultCountry: UserCountry = {
    name: "United States",
    code: "US",
  };

  if (!userCountryCookie) {
    return defaultCountry;
  } else {
    const parsedCountry = JSON.parse(userCountryCookie.value);
    if (
      parsedCountry &&
      typeof parsedCountry === "object" &&
      "name" in parsedCountry &&
      "code" in parsedCountry
    ) {
      return parsedCountry as UserCountry;
    } else {
      return defaultCountry;
    }
  }
}

export async function getRatingStatistics(productId: string) {
  const ratingstats = await db.review.groupBy({
    by: ["rating"],
    where : {productId},
    _count: {rating: true},
  });
  
  // Calculate the total number of reviews
  const totalReviews = ratingstats.reduce((sum, stat) => sum + stat._count.rating ,0);

  const ratingCounts = Array(5).fill(0);
  ratingstats.forEach((rt) => (ratingCounts[rt.rating - 1] = rt._count.rating));

  // Get the count of reviews with images
  const reviewsWithImages = await db.review.count({
    where: {
      productId,
      images: { some: {} },  //find the reviews with at least something in images field
    },
  });

  return {
    ratingStatistics: ratingCounts.map((count, index) => ({
      rating: index + 1,
      numReviews: count,
      percentage: totalReviews > 0 ?  (count / totalReviews) * 100 : 0,
    })),
    reviewsWithImages,
    totalReviews,
  };
}

// Function: getShippingDetails
// Description: retrieves and calculate shipping details based on user country and product
// Permission Level: Public
// Parameters:
//   - shippingFeeMethod: the shipping fee method of the product
//   - userCountry: the parsed userCountry object from the cookie
//   - store: Store details
// Returns: Calculated shipping details.
export async function getShippingDetails(
  shippingFeeMethod: ShippingFeeMethod,
  userCountry: UserCountry,
  store: Store,
  freeShipping: CountriesWithFreeShippingType | null,
) {
  let shippingDetails = {
    shippingFeeMethod,
    shippingService: "",
    shippingFee: 0,
    extraShippingFee: 0, // Shipping fee for additional items
    deliveryTimeMin: 0,
    deliveryTimeMax: 0,
    returnPolicy: "",
    countryCode: userCountry.code,
    countryName: userCountry.name,
    freeShipping: false,
  };

  const country = await db.country.findUnique({
    where: { code: userCountry.code },
  });

  if (country) {
    const shippingRate = await db.shippingRate.findUnique({
      where: {
        storeId_countryId: { storeId: store.id, countryId: country.id },
      },
    });

    const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy;
    const shippingService =
      shippingRate?.shippingService || store.defaultShippingService;
    const shippingFeePerItem =
      shippingRate?.shippingFeePerItem || store.defaultShippingFeePerItem;
    const shippingFeePerAdditionalItem =
      shippingRate?.shippingFeePerAdditionalItem ||
      store.defaultShippingFeePerAdditionalItem;
    const shippingFeePerKg =
      shippingRate?.shippingFeePerKg || store.defaultShippingFeePerKg;
    const shippingFeeFixed =
      shippingRate?.shippingFeeFixed || store.defaultShippingFeeFixed;
    const deliveryTimeMin =
      shippingRate?.deliveryTimeMin || store.defaultDeliveryTimeMin;
    const deliveryTimeMax =
      shippingRate?.deliveryTimeMax || store.defaultDeliveryTimeMax;

    shippingDetails = {
      shippingFeeMethod,
      shippingService,
      shippingFee: 0,
      extraShippingFee: 0, // Shipping fee for additional items
      deliveryTimeMin,
      deliveryTimeMax,
      returnPolicy,
      countryCode: userCountry.code,
      countryName: userCountry.name,
      freeShipping: false,
    };

    // Check for free shipping
    if (freeShipping) {
      const freeShippingCountries = freeShipping.eligibleCountries;
      const checkFreeShipping = freeShippingCountries.find(
        (c) => c.countryId === country.id
      );

      if (checkFreeShipping) {
        shippingDetails.freeShipping = true;
        return shippingDetails;
      }
    }

    switch (shippingFeeMethod) {
      case ShippingFeeMethod.ITEM:
        shippingDetails.shippingFee = shippingFeePerItem;
        shippingDetails.extraShippingFee = shippingFeePerAdditionalItem;
        break;
      case ShippingFeeMethod.WEIGHT:
        shippingDetails.shippingFee = shippingFeePerKg;
        break;
      case ShippingFeeMethod.FIXED:
        shippingDetails.shippingFee = shippingFeeFixed;
        break;
      default:
        break;
    }
  } // end of if clause for (country)
  return shippingDetails;
}






