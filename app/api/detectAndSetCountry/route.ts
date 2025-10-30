import { NextResponse } from "next/server";
import COUNTRIES from "@/lib/data/countries.json";

const DEFAULT_COUNTRY = { name: "United States", code: "US" };
export const runtime = "edge"; // This is the critical line

export async function POST(req: Request) {
  let countryCode;

  // This logic is now simplified because we are always on the Edge in production
  // In production on Vercel, use the reliable req.geo object.
  if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    countryCode = (req as any).geo?.country;
  } else {
    // In development, fall back to an IP lookup API.
    // Vercel provides the user's IP in this header during development.
    const ip = req.headers.get("x-forwarded-for");
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    countryCode = data.country_code;
  }

  if (countryCode) {
    const userCountry =
      COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_COUNTRY;

    // Create a response object to set the cookie on
    const response = NextResponse.json({ success: true, country: userCountry }, {status: 200});

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