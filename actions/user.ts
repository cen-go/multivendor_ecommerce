"use server"

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server"

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
