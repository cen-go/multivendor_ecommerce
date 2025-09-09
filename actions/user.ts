"use server"

import db from "@/lib/db";
import { CartProductType, UserCountry } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers";
import { getShippingDetails } from "./product";
import { ShippingFeeMethod } from "@prisma/client";

// Function: followStore
// Description: Toggle follow status for a store by the current user.
//              If the user is not following the store, it follows the store.
//              If the user is already following the store, it unfollows the store.
// Permission Level: User
// Parameters: storeId - The ID of the store to be followed/unfollowed.
// Returns: {boolean} - Returns true if the user is now following the store, false if unfollowed.
export async function followStore(storeId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, message: "Unauthenticated" };
    }

    const store = await db.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return { success: false, message: "Store not found." };
    }

    const dbUser = await db.user.findUnique({
      where: {id: user.id},
    });

    if (!dbUser) {
      return { success: false, message: "User not found." };
    }

    // Check if the user is already following the store
    const UserFollowingStore = await db.user.findUnique({
      where: {
        id: dbUser.id,
        following: {
          some: {id: storeId},
        },
      },
    });

    if (UserFollowingStore) {
      // User already following the store then unfollow it
      await db.store.update({
        where: {id: storeId},
        data: {
          followers: {
            disconnect: {id: dbUser.id}
          },
        },
      });

      return { success: true, message: "Unfollowed the store.", result: false };
    } else {
      // Follow the store
      await db.store.update({
        where: {id: storeId},
        data: {
          followers: {
            connect: {id: dbUser.id}
          },
        },
      });
      return { success: true, message: "Followed the store.", result: true };
    }

  } catch (error) {
    console.error("Error in toggling follow store status: ", error);
    return { success: false, message: "An unexpected error occured!" };
  }
}


// Function: saveUserCart
// Description: Saves the user's cart by validating product data from the database
//              and assuring no front-end manipulation.
// Permission Level: User who owns the cart
// Parameters:
//   - cartProducts: An array of products from the frontend cart.
//   - userCountry: the parsed userCountry object from the cookie
//   - store: Store details
// Returns: An object containing the updated cart with recalculated total price and validated product data.
export async function saveUserCart(cartProducts:CartProductType[]) {
  try {
    const user = await currentUser();
    if (!user) {
      return {success: false, message: "Unauthenticated."};
    }
    const userId = user.id;

    // Search for an existing user cart
    const existingCart = await db.cart.findUnique({ where: { userId } });
    // delete the old cart (if exists) before saving the new one
    if (existingCart) {
      await db.cart.delete({ where: { userId } });
    }

    // Fetch product, variant and size data from the database and validate
    const validatedCartItems = await validateCartProducts(cartProducts);

    // Recalculate cart's total price and shipping fees
    const subtotal = validatedCartItems.reduce((total, item) => total + item.price * item.quantity,0);
    const shippingFees = validatedCartItems.reduce((total, item) => total + item.shippingFee,0);
    const totalPrice = subtotal + shippingFees;

    // save the validated items to the cart in the database
    const cart = await db.cart.create({
      data: {
        subtotal,
        shippingFees,
        total: totalPrice,
        cartItems: {
          create: validatedCartItems.map((item) => ({
            name: item.combinedName,
            productId: item.productId,
            variantId: item.variantId,
            productSlug: item.productSlug,
            variantSlug: item.variantSlug,
            image: item.image,
            size: item.size,
            sizeId: item.sizeId,
            storeId: item.storeId,
            sku: item.sku,
            price: item.price,
            totalPrice: item.totalPrice,
            quantity: item.quantity,
            shippingFee: item.totalShippingFee,
          })),
        },
        user: {connect: {id: userId}}
      },
    });

    return {success:true, message: "Shopping cart saved", data: cart};

  } catch (error) {
    console.error("Error saving the user cart: ", error)
    return { success: false, message: "An unexpected error occured!" };
  }
}

export async function validateCartProducts(cartProducts: CartProductType[] ) {
  // Fetch product, variant and size data from the database and validate
    const validatedCartItems = await Promise.all(
      cartProducts.map(async (cartProduct) => {
        const { productId, variantId, sizeId } = cartProduct;

        const dbProduct = await db.product.findUnique({
          where: { id: productId },
          include: {
            store: true,
            freeShipping: {
              include: { eligibleCountries: true },
            },
            variants: {
              where: { id: variantId },
              include: {
                sizes: {
                  where: { id: sizeId },
                },
                images: true,
              },
            },
          },
        });

        // Validate the product coming from the front-end
        if (
          !dbProduct ||
          dbProduct.variants.length === 0 ||
          dbProduct.variants[0].sizes.length === 0
        ) {
          throw new Error(`Invalid Product, ${cartProduct.name}-${cartProduct.variantName}-${cartProduct.size}`);
          ;
        }

        const variant = dbProduct.variants[0];
        const size = variant.sizes[0];

        // Validate stock and price
        const validQuantity = Math.min(cartProduct.quantity, size.quantity);
        const price = size.discount
          ? size.price * (1 - size.discount / 100)
          : size.price;

        // Calculate shipping details
        const cookieStore = await cookies();
        const countryCookie = cookieStore.get("userCountry");

        if (!countryCookie) {
          throw new Error("Country cookie not found!");
        }

        const country = JSON.parse(countryCookie.value) as UserCountry;
        const details = await getShippingDetails(
          dbProduct.shippingFeeMethod,
          country,
          dbProduct.store,
          dbProduct.freeShipping
        );

        let totalShippingFee = 0;

        if (dbProduct.shippingFeeMethod === ShippingFeeMethod.ITEM) {
          totalShippingFee =
            details.shippingFee +
            (validQuantity > 1
              ? details.extraShippingFee * (validQuantity - 1)
              : 0);
        } else if (dbProduct.shippingFeeMethod === ShippingFeeMethod.WEIGHT) {
          totalShippingFee =
            details.shippingFee *
            (variant.weight ? variant.weight.toNumber() : 0) *
            validQuantity;
        } else if (dbProduct.shippingFeeMethod === ShippingFeeMethod.FIXED) {
          totalShippingFee = details.shippingFee;
        }

        return {
          productId,
          variantId,
          productSlug: dbProduct.slug,
          variantSlug: variant.slug,
          sizeId,
          storeId: dbProduct.storeId,
          sku: variant.sku,
          name: dbProduct.name,
          variantName: variant.variantName,
          combinedName: `${cartProduct.name}-${cartProduct.variantName}-${cartProduct.size}`,
          brand: dbProduct.brand,
          image: variant.images[0].url,
          variantImage: variant.variantImage,
          weight: variant.weight?.toNumber(),
          stock: size.quantity,
          size: size.size,
          quantity: validQuantity,
          price,
          totalShippingFee,
          totalPrice: price * validQuantity + totalShippingFee,
          shippingMethod: details.shippingFeeMethod,
          shippingService: details.shippingService,
          freeShipping: details.freeShipping,
          shippingFee: details.shippingFee,
          extraShippingFee: details.extraShippingFee,
          deliveryTimeMin: details.deliveryTimeMin,
          deliveryTimeMax: details.deliveryTimeMax
        };
      })
    );

    return validatedCartItems
}

// Function: addToWishlist
// Description: Adds a product to user's wishlist
// Permission Level: User
// Parameters:
//   - productId: ID of the product to add to the wishlist
//   - variantId
//   - sizeId: optional size ID
export async function addToWishlist(productId: string, variantId: string, sizeId?:string) {
  try {
    const user = await currentUser();
    if (!user) {
      return {success: false, message: "You need to be logged in, in order to add a product to your wishlist."};
    }

    const userId = user.id;

    // Check if the product is already in the wishlist
    const existingItem = await db.wishlist.findFirst({
      where: {
        userId,
        productId,
        variantId,
      },
    });

    if (existingItem) {
      await db.wishlist.delete({
        where: { id: existingItem.id },
      });
      return { success: true, message: "Product removed from the wishlist." };
    } else {
      await db.wishlist.create({
        data: {
          userId,
          productId,
          variantId,
          sizeId,
        },
      });
      return { success: true, message: "Product added to the wishlist." };
    }
  } catch (error) {
    console.error("Error while adding item to wishlist: ", error);
    return {success: false, message: "An unexpected error occured."};
  }
}