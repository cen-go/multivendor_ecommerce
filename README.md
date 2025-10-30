# Multivendor E‑commerce (Next.js) — Portfolio Project

A full‑featured multivendor e‑commerce demo built with Next.js (App Router), Prisma, PostgreSQL (Neon), Stripe and PayPal integrations, and a Tailwind CSS UI.

This README contains quick setup, payment gateway notes, seeding instructions, and common troubleshooting tips tailored for this repo.

---

## Features
- Multi‑vendor store pages and admin dashboard
- Product/variant/size data model with stock handling
- Stripe PaymentIntent flow + server actions
- PayPal order creation & capture + server actions
- Prisma + PostgreSQL (Neon) with transaction-safe stock updates
- Client UI: Tailwind, Swiper carousel, React Table, etc.

---

## Tech stack
- Next.js (App Router)
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Stripe, PayPal SDKs
- Tailwind CSS, Swiper,
- Zustand

---

## Prerequisites
- Node.js 18+
- npm or preferred package manager
- A PostgreSQL database (Neon, Supabase, etc.)
- Stripe account (test keys)
- PayPal developer account (sandbox client id & secret)

---

## Environment variables

Create a `.env` file in project root with at least:

```
DATABASE_URL="postgresql://user:pass@host:port/dbname?schema=public"
NEXTAUTH_URL="http://localhost:3000"    # if applicable
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
# Optional for Vercel quick workaround (legacy peer deps)
# NPM_CONFIG_LEGACY_PEER_DEPS=true
```

Never commit secrets.

---

## Local setup

1. Install deps
   npm install

2. Generate Prisma client
   npx prisma generate

3. Run migrations (if you changed schema)
   npx prisma migrate dev --name init

4. Seed data (products, variants, sizes) --OPTIONAL--
   - This repo includes a standalone seeding helper script and sample data. Or you can create your own data in Admin and seller dashboards.
   - Example JS script (create `scripts/seed-sizes.js`) reads `lib/migration scripts/sizes.json` and upserts sizes.
   - Run:
     - Ensure `DATABASE_URL` is set (in `.env`).
     - node ./scripts/seed-sizes.js

5. Start dev server
   npm run dev
   Open http://localhost:3000

---

## Running seed script (example)

Save this as `./scripts/seed-sizes.js` (if not present) and run `node ./scripts/seed-sizes.js`.

Important notes:
- Seed in order: Products → ProductVariants → Sizes.
- The script checks that referenced productVariant IDs exist and will skip missing parents (to avoid Prisma P2003 FK errors).

If you prefer TypeScript seeds, use `ts-node` or compile to JS.

---

## Payment gateway setup

PayPal (Sandbox)
- Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in `.env`.
- createPayPalPayment (server action) should return the PayPal order ID string to the client (not an object).
- capturePayPalPayment captures server-side and performs DB changes inside a transaction.

Stripe (Test)
- Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in `.env`.
- createStripePaymentIntent runs server‑side and returns a client secret.
- Confirm payment on client using `PaymentElement` and `confirmPayment`, then record payment server‑side.

Notes:
- Always keep API keys server-side.
- For PayPal `onApprove`, return a promise and ensure `createOrder` returns the order id string.

---

## Common issues & troubleshooting

1. Peer dep conflicts on Vercel (React 19 vs packages requiring <=18)
   - Quick workaround (portfolio projects): In Vercel Dashboard → Environment Variables add:
     - Name: `NPM_CONFIG_LEGACY_PEER_DEPS`, Value: `true` (apply to Build).
   - Better long term: replace incompatible package with a maintained alternative.

2. react-tag-input / react-dnd errors during build
   - Install missing peer deps:
     npm install react-dnd react-dnd-html5-backend
   - Or replace the package if it is not React‑19 compatible.

3. Swiper 12 imports / layout overflow
   - Use v12 imports: `import { Swiper, SwiperSlide } from "swiper/react"; import { Autoplay, EffectCube } from "swiper/modules";`
   - For cube effect, wrap Swiper in a constrained container and add `overflow-hidden` to avoid horizontal overflow:
     `<div className="w-full h-[420px] overflow-hidden"> ... </div>`
   - Ensure parent element of `Image` using `fill` is `position: relative` and has fixed height.

4. Prisma P2003 (foreign key violation) during seeding
   - Seed parents first: Product → ProductVariant → Size.
   - Verify IDs in your JSON seeds match actual records.
   - Run seeding as standalone Node script (not inside a Next page).

5. Next.js "Dynamic server usage" at build
   - Occurs when `headers()`, `cookies()`, or `currentUser()` is used during static prerender.
   - Fix: mark page dynamic if it requires request-scoped APIs:
     Add to top of page component:
     `export const dynamic = "force-dynamic";`
   - Or move auth-dependent data fetching to runtime / client API.

6. TypeScript and `react-hook-form` + Zod resolver mismatch
   - Let `useForm` infer types from the Zod resolver:
     `const form = useForm({ resolver: zodResolver(schema), defaultValues: ... })`
   - Or ensure the generic type passed to `useForm<>` exactly matches `z.infer<typeof schema>`.

---

## Build & Deploy (Vercel)

- Use the Vercel Git integration. For portfolio quick fixes:
  - If peer deps conflict on build, use environment variable `NPM_CONFIG_LEGACY_PEER_DEPS=true` in Vercel (Build).
  - Prefer to fix incompatible packages for long term.

- If you have admin pages using `currentUser()`, if needed add `export const dynamic = "force-dynamic";` to avoid static prerender errors.

---

## Useful commands

- Install deps: npm install
- Dev: npm run dev
- Build: npm run build
- Prisma generate: npx prisma generate
- Prisma migrate: npx prisma migrate dev --name <name>

---

## Notes & best practices
- Keep all secrets in `.env` and in Vercel env vars.
- For price sorting and correct pagination, maintain a `product.minPrice` (cents) DB column and keep it updated inside transactions when sizes/prices change.
- Keep payment capture logic server-side and DB updates in a single transaction for consistency.

---

## State management (Zustand)

This project uses Zustand for app-wide state (cart store included). Zustands' lightweight API requires no provider and works in client components.

- Package included: zustand (see package.json).
- Cart store file: `store/useCartStore.ts` (exports `useCartStore`).

Usage (client component):

```tsx
import "use client";
import { useCallback } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function AddToCartButton({ product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const totalItems = useCartStore((s) => s.totalItems);

  const onAdd = useCallback(() => {
    addToCart({
      productId: product.id,
      variantId: product.variantId,
      sizeId: product.sizeId,
      name: product.name,
      price: product.price, // cents
      quantity: 1,
      image: product.image,
    });
  }, [addToCart, product]);

  return (
    <button onClick={onAdd}>
      Add to cart ({totalItems})
    </button>
  );
}
```

Notes
- Ensure components using the store are client components (`"use client"`).
- Persist is already enabled in `store/useCartStore.ts` (key: `storageCart`), which uses localStorage in browser — this is client-only.
- If you use server components that need cart info, read cart server-side via an API route or pass cart data from a client component.

---

If you want, I can:
- Add the `scripts/seed-sizes.js` file to the repo,
- Add a `package.json` script like `"seed:sizes": "node ./scripts/seed-sizes.js"`,
- Or update README with screenshots / example env values.
