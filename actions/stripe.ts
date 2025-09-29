"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { PaymentIntent } from "@stripe/stripe-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export async function createStripePaymentIntent(orderId: string) {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("Unauthenticated");
    }

    // Fetch the order to get the total price
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.paymentStatus === "PAID") {
      throw new Error("This order is already paid.");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.total,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error("Error creating Stripe Payment intent: ", error);
    throw error;
  }
}

export async function insertStripePaymentIntoDb(
  orderId: string,
  paymentIntent: PaymentIntent
) {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, message: "Unauthenticated" };
    }

    // Fetch the order to get the total price
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, message: "Order not found." };
    }

    await db.$transaction(async (tx) => {
      const newPaymentDetails = await tx.paymentDetails.upsert({
        where: { orderId },
        update: {
          paymentIntentId: paymentIntent.id,
          paymentMethod: "Stripe",
          status:
            paymentIntent.status === "succeeded"
              ? "Completed"
              : paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        create: {
          paymentIntentId: paymentIntent.id,
          paymentMethod: "Stripe",
          status:
            paymentIntent.status === "succeeded"
              ? "Completed"
              : paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          orderId,
          userId: user.id,
        },
      });

      // Connect the order with the new payment details
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentDetails: { connect: { id: newPaymentDetails.id } },
          paymentStatus:
            paymentIntent.status === "succeeded" ? "PAID" : "FAILED",
        },
        include: {
          orderGroups: {
            include: { orderItems: true },
          },
        },
      });

      // If the payment was success then reduce the stock of the items
      if (paymentIntent.status === "succeeded") {
        const { orderGroups } = order;
        for (const group of orderGroups) {
          for (const item of group.orderItems) {
            await tx.size.update({
              where: { id: item.sizeId },
              data: {
                quantity: { decrement: item.quantity },
              },
            });
          }
        }
      }
    });

    return { success: true, message: "Order updated successfully." };
  } catch (error) {
    console.error("Error saving Stripe Payment to db: ", error);
    return {
      success: false,
      message: "An error occured while updating order information.",
    };
  }
}
