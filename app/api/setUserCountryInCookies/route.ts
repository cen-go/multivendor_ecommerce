import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { userCountry } = body;

    if (!userCountry) {
      return new NextResponse("User country data not recieved by the server", {
        status: 400,
      });
    }

    const response = new NextResponse("User country saved", { status: 200 });

    response.cookies.set("userCountry", JSON.stringify(userCountry), {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true, // Cookie cannot be accesed by Javascript
      secure: process.env.NODE_ENV === "production", // secure cookie in production
      sameSite: "lax", // helps protect against CSRF attacks
    });

    return response;
  } catch (error) {
    console.error("Error saving user location: ", error);
    return new NextResponse("couldn't save location data.", { status: 500 });
  }
}
