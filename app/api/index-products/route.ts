import { NextResponse } from "next/server";
import client from "@/lib/elastic-client";
import db from "@/lib/db";

// POST api route for indexing products and variants on elasticsearch
export async function POST() {
  try {
    // Delete all indices
    await client.indices.delete({index: "products", ignore_unavailable: true});

    // Fetch products and their variants from the database
    const products = await db.product.findMany({
      select: {
        name: true,
        brand: true,
        slug: true,
        variants: {
          select: {
            id: true,
            variantName: true,
            slug: true,
            sku: true,
            images: {
              select: {url: true},
              take: 1,
            },
          },
        },
      },
    });
    
    // Prepare the body for bulk indexing in elasticsearch
    const body = products.flatMap((product) =>
      product.variants.flatMap((variant) => [
        { index: { _index: "products", _id: variant.id } },
        {
          name: `${product.brand} ${product.name} - ${variant.variantName}`,
          link: `/product/${product.slug}/${variant.slug}`,
          image: variant.images[0].url,
        },
      ])
    );

    // run bulk index request on elasticsearch
    const bulkResponse = await client.bulk({refresh: true, body, });

    // check if there are any errors in elasticsearch's response
    if (bulkResponse.errors) {
      return NextResponse.json({message: "Failed to index products on elasticsearch"}, {status: 500});
    }

    return NextResponse.json({message: "Products indexed on elasticsearch successfully"}, {status: 200})
  } catch (error) {
    return NextResponse.json({message: `Unexpected error while indexing ==> ${error}`}, {status: 500});
  }
}