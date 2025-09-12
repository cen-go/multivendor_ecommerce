import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserCountry } from './lib/utils';

const isProtectedRoute = createRouteMatcher(["/dashboard", "/dashboard/(.*)", "/checkout"]);

export default clerkMiddleware(async (auth, req) => {
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
    response = NextResponse.redirect(new URL(req.url));
    // step-2 Get the user country using the util function
    const userCountry = await getUserCountry();
    // Set a cookie with the detected country for future requests
    response.cookies.set("userCountry", JSON.stringify(userCountry), {
      maxAge: 3600 * 24 * 30,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
    });
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