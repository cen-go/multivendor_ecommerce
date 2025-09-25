"use client"

import { ReactNode } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

export default function StripeWrapper({
  children,
  amount,
}: {
  children: ReactNode;
  amount: number;
}) {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)
  return (
    <Elements stripe={stripePromise} options={{mode: "payment", amount: Math.round(amount), currency: "usd"}}>
      {children}
    </Elements>
  );
}
