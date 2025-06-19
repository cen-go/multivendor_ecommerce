import { getAllCategories } from "@/actions/category";
import { getProductMainInfo } from "@/actions/product";
import ProductDetails from "@/components/dashboard/forms/product-details";

export default async function SellerNewProductVariantPage({
  params,
}: {
  params: Promise<{ productId: string; storeUrl: string; }>;
}) {
  const { productId, storeUrl } = await params;

  const categories = await getAllCategories();

  const productMainInfo = await getProductMainInfo(productId);

  if (!productMainInfo) return null;

  return <div>
    <ProductDetails data={productMainInfo}  categories={categories} storeUrl={storeUrl} />
  </div>;
}
