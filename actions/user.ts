"use server"

import db from "@/lib/db";
import { CartProductType, CartWithCartItemsType, UserCountry } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server"
import { cookies } from "next/headers";
import { getShippingDetails } from "./product";
import { CartItem, Prisma, ShippingAddress, ShippingFeeMethod } from "@prisma/client";
import { ShippingAddressSchema } from "@/lib/schemas";

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
    const validatedCartItems = await validateCartProducts({cartProducts,});

    // Recalculate cart's total price and shipping fees
    const subtotal = validatedCartItems.reduce((total, item) => total + item.price * item.quantity,0);
    const shippingFees = validatedCartItems.reduce((total, item) => total + item.totalShippingFee,0);
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


// Function to revalidate products to avoid front end manipulations
// and remake the calculations when the country data changes
export async function validateCartProducts({
  cartProducts,
  countryId,
  updateCartInDb = false,
  cartId,
}: {
  cartProducts: (Omit<
    CartItem,
    "createdAt" | "updatedAt" | "sku" | "totalPrice" | "storeId" | "id" | "cartId"
  > & Partial<Pick<CartItem, "id" | "cartId">>)[];
  countryId?: string;
  updateCartInDb?: boolean;
  cartId?: string;
}) {
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
        throw new Error(`Invalid Product`);
      }

      const variant = dbProduct.variants[0];
      const size = variant.sizes[0];

      // Validate stock and price
      const validQuantity = Math.min(cartProduct.quantity, size.quantity);
      const price = size.discount
        ? size.price * (1 - size.discount / 100)
        : size.price;

      // Calculate shipping details based on country
      let country: UserCountry;

      if (countryId) {
        // country Id is provided then we calculate based on the country in user address
        // this will apply before checkout
        const dbCountry = await db.country.findUnique({
          where: { id: countryId },
        });
        if (!dbCountry) {
          throw new Error("Country not found!");
        }
        country = { name: dbCountry.name, code: dbCountry.code };
      } else {
        // otherwise read the country from cookies. this will apply on regular
        // country switches made from header bar
        const cookieStore = await cookies();
        const countryCookie = cookieStore.get("userCountry");

        if (!countryCookie) {
          throw new Error("Country cookie not found!");
        }

        country = JSON.parse(countryCookie.value) as UserCountry;
      }

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

      if (updateCartInDb) {
        await db.cartItem.update({
          where: {id: cartProduct.id},
          data: {
            quantity: validQuantity,
            price,
            shippingFee: totalShippingFee,
            totalPrice: price * validQuantity + totalShippingFee,
          }
        });
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
        combinedName: `${dbProduct.name}-${variant.variantName}-${size.size}`,
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
        deliveryTimeMax: details.deliveryTimeMax,
      };
    })
  ); // End of Promise.all

  if (updateCartInDb) {
    const subtotal = validatedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFees = validatedCartItems.reduce(
      (sum, item) => sum + item.totalShippingFee,
      0
    );
    let total = subtotal + shippingFees;
    let discountedAmount = 0;

    // check if a coupon is applied to the cart
    const cartCoupon = await db.cart.findUnique({
      where: { id: cartProducts[0].cartId },
      select: {
        coupon: {
          include: {
            store: { select: { id: true, url: true, name: true } },
          },
        },
      },
    });

    if (cartCoupon?.coupon) {
      const { coupon } = cartCoupon;

      // Validate the coupons date range
      const currentDate = new Date();
      const startDate = new Date(coupon.startDate);
      const endDate = new Date(coupon.endDate);

      if (currentDate < startDate || currentDate > endDate) {
        // Coupon has expired discount will be 0
        discountedAmount = 0;
      } else {
        // Filter the items from the related store
        const itemsFromCouponStore = validatedCartItems.filter(
          (item) => item.storeId === coupon.storeId
        );
        const subtotalOfCouponProducts = itemsFromCouponStore.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        discountedAmount = Math.round(
          (subtotalOfCouponProducts * coupon.discount) / 100
        );
      }
    }

    total -= discountedAmount;

    await db.cart.update({
      where: { id: cartId },
      data: { subtotal, shippingFees, total },
    });
  }

  return validatedCartItems;
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

// Function: getUserShippingAddresses
// Description: Retrieves all shipping addresses for a specific user.
// Permission Level: User who owns the addresses
// Parameters: - userId: ID of the user whose addresses to be fetched
// Returns: List of shipping addresses for the user.
export async function getUserShippingAddresses(userId:string) {
  const userAdresses = await db.shippingAddress.findMany({
    where: {userId},
    include: {country: true},
  });

  return userAdresses
}


// Function: upsertUserAddress
// Description: creates a new address for a specific user or updates an existing address.
// Permission Level: User.
// Parameters: - address: Address details from the form data
// Returns: returns information about status and the address data.
export async function upsertUserAddress(
  address: Omit<ShippingAddress, "createdAt" | "updatedAt" | "userId">
) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "Unauthenticated." };
    }
    const userId = user.id;

    // Validate the data coming from the form
    const validatedAddress = ShippingAddressSchema.safeParse(address);

    if (!validatedAddress.success) {
      const { fieldErrors, formErrors } = validatedAddress.error.flatten();
      return {
        success: false,
        message: "Error validating form data",
        fieldErrors,
        formErrors,
      };
    }

    const addressData = validatedAddress.data;

    // If default selected in form check for a default address that already exist in db
    if (addressData.default) {
      const prevDefaultAddress = await db.shippingAddress.findFirst({
        where: {
          userId,
          default: true,
        },
      });

      // If there is a previeous default address and it's different
      // than the one we might be updating then update it's default field to false
      if (prevDefaultAddress && address.id !== prevDefaultAddress.id) {
        await db.shippingAddress.update({
          where: { id: prevDefaultAddress.id },
          data: { default: false },
        });
      }
    }

    // Upsert the user address into the database
    const upsertedAddress = db.shippingAddress.upsert({
      where: { id: address.id },
      update: {
        ...addressData,
        updatedAt: new Date(),
      },
      create: {
        ...addressData,
        userId,
      },
    });
    return {
      success: true,
      message: `Address ${address.id ? "updated" : "added"}.`,
      data: upsertedAddress,
    };
  } catch (error) {
    console.error("Error saving the user address: ", error);
    return { success: false, message: "An unexpected error occured!" };
  }
}

// Function: PlaceOrder
// Description: creates a new address for a specific user or updates an existing address.
// Permission Level: User.
// Parameters: - address: Details of the selected address for the order.
//             - cartId: ID of the cart that is going to be placed order
// Returns: returns information about status and the address data and
// the id of the order if it's successfully created.
export async function placeOrder(address: ShippingAddress, cartId: string ) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, message: "Unauthenticated." };
    }
    const userId = user.id;

    // Fetch user's cart with items in it
    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: { cartItems: true, coupon: true },
    });

    if (!cart) {
      return { success: false, message: "Cart not found." };
    }

    const cartCoupon = cart.coupon;

    // Validate the address
    const dbAddress = await db.shippingAddress.findUnique({
      where: { id: address.id },
    });

    if (!dbAddress) {
      return { success: false, message: "User address couldn't found." };
    }

    const cartItems = cart.cartItems;
    const validatedCartItems = await validateCartProducts({
      cartProducts: cartItems,
      countryId: dbAddress.countryId,
    });

    // define type for order itemds grouped by store
    type GroupedOrderItems = {
      [storeId: string]: {
        items: typeof validatedCartItems;
        coupon: string | null;
        subtotal: number;
        shippingFees: number;
        total: number;
      };
    };
    // Group the items by store with array reduce method
    const groupedOrderItems = validatedCartItems.reduce((acc, item) => {
      // if store id of the product doesn't exist in the accumulator object as a key
      // then create it as a key and asign an empty array to it
      if (!acc[item.storeId]) {
        acc[item.storeId] = {
          items: [],
          coupon: null,
          subtotal: 0,
          shippingFees: 0,
          total: 0,
        };
      }
      // Push the product in the the array with the corresponding store id as it's key
      acc[item.storeId].items.push(item);
      return acc;
    }, {} as GroupedOrderItems);

    const storeIds = Object.keys(groupedOrderItems);

    // Calculate subtotal, shipping fees and total price for each group, calculate discount if a coupon is applied
    storeIds.forEach((storeId) => {
      const groupSubtotal = groupedOrderItems[storeId].items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const groupShippingFees = groupedOrderItems[storeId].items.reduce(
        (sum, item) => sum + item.totalShippingFee,
        0
      );
      let groupTotal = groupSubtotal + groupShippingFees;

      if (cartCoupon && cartCoupon.storeId === storeId) {
        const discount = Math.round(
          (groupSubtotal * cartCoupon.discount) / 100
        );
        groupTotal -= discount;
        groupedOrderItems[storeId].coupon = cartCoupon.id;
      }
      groupedOrderItems[storeId].subtotal = groupSubtotal;
      groupedOrderItems[storeId].shippingFees = groupShippingFees;
      groupedOrderItems[storeId].total = groupTotal;
    });

    // Calculate the fees for the total of the order
    const subtotal = storeIds.reduce(
      (sum, storeId) => sum + groupedOrderItems[storeId].subtotal,
      0
    );
    const shippingFees = storeIds.reduce(
      (sum, storeId) => sum + groupedOrderItems[storeId].shippingFees,
      0
    );
    const total = storeIds.reduce(
      (sum, storeId) => sum + groupedOrderItems[storeId].total,
      0
    );

    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          shippingAddressId: address.id,
          shippingFees,
          subtotal,
          total,
          orderGroups: {
            create: Object.keys(groupedOrderItems).map((store) => ({
              shippingService:
                groupedOrderItems[store].items[0].shippingService,
              deliveryTimeMin:
                groupedOrderItems[store].items[0].deliveryTimeMin,
              deliveryTimeMax:
                groupedOrderItems[store].items[0].deliveryTimeMax,
              storeId: store,
              shippingFees: groupedOrderItems[store].shippingFees,
              subtotal: groupedOrderItems[store].subtotal,
              total: groupedOrderItems[store].total,
              couponId: groupedOrderItems[store].coupon,
              orderItems: {
                create: groupedOrderItems[store].items.map(
                  (item) =>
                    ({
                      name: item.combinedName,
                      productId: item.productId,
                      variantId: item.variantId,
                      sizeId: item.sizeId,
                      productSlug: item.productSlug,
                      variantSlug: item.variantSlug,
                      size: item.size,
                      sku: item.sku,
                      image: item.image,
                      quantity: item.quantity,
                      shippingFee: item.shippingFee,
                      price: item.price,
                      totalPrice: item.totalPrice,
                    } as Prisma.OrderItemCreateInput)
                ),
              },
            })),
          },
        },
      });

      // decrease the stock if the order is placed successfully
      for (const item of validatedCartItems) {
        await tx.size.update({
          where: { id: item.sizeId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Delete the cart
      await tx.cart.delete({ where: { id: cartId } });

      return createdOrder;
    });

    return {
      success: true,
      message: "Order successfully created",
      orderId: order.id,
    };
  } catch (error) {
    console.error("Error placing the order: ", error)
    return { success: false, message: "An unexpected error occured!" };
  }
}

// validates cart items again and recalculates shipping costs after selected address changes
export async function revalidateCheckoutCart(cart:CartWithCartItemsType, countryId?: string) {
  try {
    await validateCartProducts({cartProducts: cart.cartItems, updateCartInDb: true, cartId: cart.id, countryId});
    const cartData = await db.cart.findUnique({
      where: { id: cart.id },
      include: { cartItems: true, coupon: { include: { store: true } } },
    });
    if (!cartData) {
      return {
      success: false,
      message: "An unexpected error occured while updating shipping details!",
      cartData: cart,
    };
    }
    return {success: true, message: "Cart data validated.", cartData, };

  } catch (error) {
    console.error("Error placing the order: ", error)
    return {
      success: false,
      message: "An unexpected error occured while updating shipping details!",
      cartData: cart,
    };
  }
}