import client from "@/lib/elastic-client";
import { NextResponse } from "next/server";

interface Product {
  name: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get("search");

  if (!searchQuery || typeof searchQuery !== "string") {
    return NextResponse.json({message: "Invalid search Query."}, {status: 400});
}
  try {
    const response = await client.search<{_source: Product}>({
      index: "products",
      query: {
        match_phrase_prefix: {
          name: searchQuery,
        },
      }
    });

    const results = response.hits.hits.map(hit => hit._source);

    return NextResponse.json(results, {status: 200});
  } catch (error) {
    console.error(error);
    return NextResponse.json({message: `unexpected search error ==> ${error}`}, {status: 500})
  }
}