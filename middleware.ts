import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import countries from "./lib/data/countries.json"
import { DEFAULT_COUNTRY } from './lib/constants';

const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/dashboard/(.*)",
  "/checkout",
  "/profile",
  "/profile/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // If the route is a webhook, skip the middleware logic
  if (req.nextUrl.pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) await auth.protect();

  // Creating a basic response
  let response = NextResponse.next();

  // ---------- Handle Country Detection ------------
  // Step-1 Check if country is already in the cookies
  const countryCookie = req.cookies.get("userCountry");

  if (countryCookie) {
    // if the user already selected a country, use this for subsequent requests
    response = NextResponse.next();
  } else {
    // Get the user's country code from the request geo headers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countryCode = (req as any).geo?.country;

    // If a country code is found, set it in the cookies
    if (countryCode) {
      const userCountry = countries.find(c => c.code === countryCode) ?? DEFAULT_COUNTRY;

      response = NextResponse.redirect(new URL(req.url));

      response.cookies.set("userCountry", JSON.stringify(userCountry), {
        maxAge: 3600 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  }
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};