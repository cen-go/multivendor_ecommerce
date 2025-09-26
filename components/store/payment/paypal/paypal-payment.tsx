"use client"

import { PayPalButtons } from "@paypal/react-paypal-js"
import { createPayPalPayment } from "@/actions/paypal";
import { useRef } from "react";

export default function PaypalPayment({orderId}: {orderId: string}) {
  const paypalOrderIdRef = useRef("");

  async function createOrder() {
    const paypalOrderId = await createPayPalPayment(orderId);
    paypalOrderIdRef.current = paypalOrderId;
    return paypalOrderId;
  }

  return (
    <div>
      <PayPalButtons
        style={{
          shape: "pill",
          label: "pay",
        }}
        createOrder={createOrder}
      />
    </div>
  );
}
