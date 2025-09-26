"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

// Function: createPayPalPayment
// Description: Creates a paypal payment and returns the payment details
// Permission Level: User
// Parameters:
//     - OrderId: The ID of the order to process the payment for
// Returns: Details for the created payment from paypal
export async function createPayPalPayment(OrderId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthenticated");
    }

    // Fetch the order to get the total price
    const order = await db.order.findUnique({
      where: { id: OrderId },
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    // Convert order total to USD from cents and string to send to paypal
    const orderTotal = (order.total / 100).toFixed(2);

    // Create a paypal access token
    const accessToken = await generatePayPalAccessToken();

    // Call paypal API to create an order
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: orderTotal,
              },
            },
          ],
        }),
      }
    );

    const orderData = await response.json();

    if (orderData.id) {
      return orderData.id;
    }

    const errorDetail = orderData?.details?.[0];
    const errorMessage = errorDetail
      ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
      : JSON.stringify(orderData);

    throw new Error(errorMessage);
  } catch (error) {
    console.error("Could not initiate PayPal Checkout: ", error);
    throw error;
  }
}

// Generate paypal access token
export async function generatePayPalAccessToken() {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalSecret = process.env.PAYPAL_SECRET;

  const paypalAuth = Buffer.from(`${paypalClientId}:${paypalSecret}`).toString(
    "base64"
  );

  const response = await fetch(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${paypalAuth}`,
      },
    }
  );

  if (!response.ok) {
    const errorMessage = await response.statusText;
    throw new Error(errorMessage);
  }

  const responseData = await response.json();
  return responseData.access_token;
}
