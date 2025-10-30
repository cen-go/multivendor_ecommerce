import { NextResponse } from "next/server";
import COUNTRIES from "@/lib/data/countries.json";

const DEFAULT_COUNTRY = { name: "United States", code: "US" };

export async function POST(req: Request) {
  // Get the user's country code from the request geo headers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countryCode = (req as any).geo?.country;

  if (countryCode) {
    const userCountry =
      COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_COUNTRY;

      const response = new NextResponse("User country saved", { status: 200 });

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