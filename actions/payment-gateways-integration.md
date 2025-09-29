# Payment Gateway Integration (PayPal & Stripe)

This project supports secure payments via **PayPal** and **Stripe**. All sensitive operations are handled server-side for maximum security and data integrity.

---

## Features

- **Server-side payment intent/order creation**
- **Atomic order/payment/stock updates**
- **User authentication and order validation**
- **Error handling and user feedback**
- **Supports both PayPal and Stripe out of the box**

---

## PayPal Integration

- **Order Creation:**  
  The server action (`createPayPalPayment`) creates a PayPal order using the PayPal API and returns the PayPal order ID to the client.

- **Payment Capture:**  
  On approval, the client calls the server action (`capturePayPalPayment`) to capture the payment, update order/payment status, and decrement stock in a transaction.

- **Best Practices:**  
  - All PayPal API calls are server-side.
  - Stock is decremented only after successful payment.
  - Handles recoverable errors (e.g., instrument declined) and provides user feedback.

---

## Stripe Integration

- **PaymentIntent Creation:**  
  The server action (`createStripePaymentIntent`) creates a Stripe PaymentIntent for the order and returns the client secret.

- **Payment Confirmation:**  
  The client uses Stripe’s `PaymentElement` and `confirmPayment` to complete the payment.

- **Database Update:**  
  After successful payment, the client calls the server action (`insertStripePaymentIntoDb`) to update payment details, order status, and decrement stock in a transaction.

- **Best Practices:**  
  - All Stripe API calls are server-side.
  - Prevents double payment by checking order status.
  - Handles errors and provides user feedback.

---

## Security

- **Secrets are never exposed to the client.**
- **All payment and order updates are performed in secure server actions.**
- **User authentication is required for all payment actions.**

---

## Extending

- To add more gateways, follow the same pattern:  
  - Server-side intent/order creation  
  - Client-side confirmation  
  - Server-side capture and DB update

---

## File Overview

- `actions/paypal.ts` — PayPal server actions
- `actions/stripe.ts` — Stripe server actions
- `components/store/payment/paypal/` — PayPal UI components
- `components/store/payment/stripe/` — Stripe UI components

---

## Troubleshooting

- Ensure all environment variables for PayPal and Stripe are set.
- Check that amounts are always in the smallest currency unit (e.g., cents for USD).
- Review server logs for error details.

---

**This setup follows industry best practices for secure, reliable, and scalable payment processing.**