import { getAllCategories } from "@/actions/category";
import ProductDetails from "@/components/dashboard/forms/product-details";
import db from "@/lib/db";

export default async function SellerNewProductPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const {storeUrl} = await params;

  const categories = await getAllCategories();
  const countries = await db.country.findMany({
    orderBy: { name: "asc" },
  });

  return <div>
    <ProductDetails categories={categories} storeUrl={storeUrl} countries={countries} />
  </div>;
}
