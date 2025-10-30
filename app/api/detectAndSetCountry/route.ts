import { NextResponse } from "next/server";
import COUNTRIES from "@/lib/data/countries.json";

const DEFAULT_COUNTRY = { name: "United States", code: "US" };
export const runtime = "edge"; // This is the critical line

export async function POST(req: Request) {
  // Use the Vercel-provided country code header. It's reliable in production
  // and when using `vercel dev` for local development.
  let countryCode = req.headers.get("x-vercel-ip-country");

  // Fallback for standard `next dev` where the Vercel header is not present.
  if (!countryCode && process.env.NODE_ENV === "development") {
    try {
      const res = await fetch(`https://ipapi.co/json/`);
      const data = await res.json();
      countryCode = data.country_code;
    } catch (error) {
      console.error("IP lookup failed in development:", error);
      countryCode = null; // Ensure it's null on failure
    }
  }

  if (countryCode) {
    const userCountry =
      COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_COUNTRY;

    // Create a response object to set the cookie on
    const response = NextResponse.json({ success: true, country: userCountry });

    // Set the cookie on the response
    response.cookies.set("userCountry", JSON.stringify(userCountry), {
      maxAge: 3600 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  }

  return NextResponse.json(
    { success: false, message: "Could not detect country." },
    { status: 400 }
  );
}