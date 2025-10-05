"use server";

import { currentUser } from "@clerk/nextjs/server";

// Function: getUserOrders
// Description: Retrieves user orders, with populated groups and items,
//              item count, and shipping address.
// Parameters:
//   - filter: String to filter orders by.
//   - page: The current page number for pagination (default = 1).
//   - pageSize: The number of products per page (default = 10).
//   - search: the string to search by.
//   - period: The period of orders u wanna get.
// Returns: Array containing user orders with groups sorted by totalPrice in descending order.
export async function getUserOrders({
  filter = "",
  page = 1,
  pageSize = 6,
  search = "",
  period = "",
}: {
  filter: string;
  page: number;
  pageSize: number;
  search: string;
  period: string;
}) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated.");
  }
  
}
