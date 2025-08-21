import { getAllCategories } from "@/actions/category";
import { getProductMainInfo } from "@/actions/product";
import ProductDetails from "@/components/dashboard/forms/product-details";
import db from "@/lib/db";

export default async function SellerNewProductVariantPage({
  params,
}: {
  params: Promise<{ productId: string; storeUrl: string; }>;
}) {
  const { productId, storeUrl } = await params;

  const categories = await getAllCategories();

  const productMainInfo = await getProductMainInfo(productId);

  const countries = await db.country.findMany({
    orderBy: { name: "asc" },
  });

  if (!productMainInfo) return null;

  return (
    <div>
      <ProductDetails
        data={productMainInfo}
        categories={categories}
        storeUrl={storeUrl}
        countries={countries}
      />
    </div>
  );
}
