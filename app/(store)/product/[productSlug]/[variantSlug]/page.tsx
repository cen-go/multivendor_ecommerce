import { getProductPageData } from "@/actions/product";

export default async function ProductVariantPage({
  params,
}: {
  params: Promise<{ productSlug: string; variantSlug: string }>;
}) {
  const { productSlug, variantSlug } = await params;

  const productData = await getProductPageData(productSlug, variantSlug);

  return <div>{productData?.name} - {productData?.variantName}</div>;
}