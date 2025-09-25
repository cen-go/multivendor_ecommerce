import PaypalWrapper from "../payment/paypal/paypal-wrapper";
import StripeWrapper from "../payment/stripe/stripe-wrapper";

interface Props {
  orderId: string;
  amount: number;
}

export default function OrderPayment({orderId, amount}: Props) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  return (
    <div className="h-full flex flex-col space-y-5">
      {/* Paypal */}
      <PaypalWrapper paypalClientId={paypalClientId as string} >
        <div></div>
      </PaypalWrapper>
      {/* Stripe */}
      <StripeWrapper amount={amount}>
        <div></div>
      </StripeWrapper>
    </div>
  )
}
