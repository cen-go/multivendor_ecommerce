"use client"

import { PayPalButtons } from "@paypal/react-paypal-js"
import { capturePayPalPayment, createPayPalPayment } from "@/actions/paypal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function PaypalPayment({orderId}: {orderId: string}) {
  const router = useRouter();

  async function createOrder() {
    const paypalOrderData = await createPayPalPayment(orderId);
    return paypalOrderData.id;
  }

  return (
    <div>
      <PayPalButtons
        style={{
          shape: "pill",
          label: "pay",
        }}
        createOrder={createOrder}
        onApprove={async (data, actions) => {
          try {
            console.log(data);
            const orderData = await capturePayPalPayment(orderId, data.orderID);

            // Three cases to handle:
            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            //   (2) Other non-recoverable errors -> Show a failure message
            //   (3) Successful transaction -> Show confirmation or thank you message

            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
              // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
              // recoverable state, per
              // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
              return actions?.restart();
            } else if (errorDetail) {
              // (2) Other non-recoverable errors -> Show a failure message
              throw new Error(
                `${errorDetail.description} (${orderData.debug_id})`
              );
            } else if (!orderData.purchase_units) {
              throw new Error(JSON.stringify(orderData));
            } else {
              // (3) Successful transaction -> Show confirmation or thank you message
              // Or go to another URL:  actions.redirect('thank_you.html');
              const transaction =
                orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
              toast.success(
                `Transaction ${transaction.status}: ${transaction.id}`
              );
              console.log(
                "Capture result",
                orderData,
                JSON.stringify(orderData, null, 2)
              );
            }
            router.refresh();
          } catch (error) {
            console.error(error);
            toast.error(`Sorry, your transaction could not be processed...`);
          }
        }}
        onError={() => console.log("PayPal Button error.")}
      />
    </div>
  );
}
