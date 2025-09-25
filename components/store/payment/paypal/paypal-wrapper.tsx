"use client"

import { ReactNode } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PaypalWrapper({children, paypalClientId}: {children: ReactNode, paypalClientId: string}) {
  return (
    <div>
      <PayPalScriptProvider options={{clientId: paypalClientId, currency: "USD"}}>
        {children}
      </PayPalScriptProvider>
    </div>
  )
}
