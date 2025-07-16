import db from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;

  // Fetch the product from the database
  const product = await db.product.findUnique({
    where: {slug: productSlug},
    include: {variants: true},
  });

  if (!product) {
    redirect("/");
  }

  // If the product exists redirect to the first variant
  if (product.variants.length > 0) {
    redirect(`/product/${product.slug}/${product.variants[0].slug}`);
  } else {
    redirect("/");
  }
}
