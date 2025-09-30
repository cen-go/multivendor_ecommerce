"use client";

// React & Next.js
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
// Stripe
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
// Server actions
import {
  createStripePaymentIntent,
  insertStripePaymentIntoDb,
} from "@/actions/stripe";
import toast from "react-hot-toast";

export default function StripePayment({ orderId }: { orderId: string }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    if (elements === null || stripe === null) {
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message);
      return;
    }

    // Create the PaymentIntent and obtain clientSecret from Stripe API
    const { clientSecret } = await createStripePaymentIntent(orderId);

    if (clientSecret) {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
        confirmParams: { return_url: `https://go-shop.com/order/${orderId}` },
      });

      if (!error && paymentIntent) {
        const res = await insertStripePaymentIntoDb(orderId, paymentIntent);
        if (!res.success) {
          toast.error(res.message);
        }
        setLoading(false);
        router.refresh();
      }

      if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Show error to your customer (for example, payment
        // details incomplete)
        setErrorMessage(error.message);
      }
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="text-white w-full p-4 bg-black mt-2 rounded-full font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:animate-pulse"
      >
        Pay
      </button>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
}
