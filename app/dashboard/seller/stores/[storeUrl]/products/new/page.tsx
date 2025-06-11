import { getAllCategories } from "@/actions/category";
import ProductDetails from "@/components/dashboard/forms/product-details";

export default async function SellerNewProductPage({
  params,
}: {
  params: Promise<{ storeUrl: string }>;
}) {
  const {storeUrl} = await params;

  const categories = await getAllCategories();

  return <div>
    <ProductDetails categories={categories} storeUrl={storeUrl} />
  </div>;
}
