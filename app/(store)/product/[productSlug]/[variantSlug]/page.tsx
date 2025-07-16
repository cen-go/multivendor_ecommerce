import { getProductPageData } from "@/actions/product";
import { notFound, redirect } from "next/navigation";

export default async function ProductVariantPage({
  params,
  searchParams,
}: {
  params: Promise<{ productSlug: string; variantSlug: string }>;
  searchParams: Promise<{ size: string }>;
}) {
  const { productSlug, variantSlug } = await params;
  const { size: sizeId } = await searchParams;

  const productData = await getProductPageData(productSlug, variantSlug);

  if (!productData) {
    return notFound();
  }

  const { sizes } = productData;

  if (sizeId) {
    //check if the sizeId valid by comparing it to available sizes
    const isValidSize = sizes.find((size) => size.id === sizeId);
    if (!isValidSize) {
      redirect(`/product/${productSlug}/${variantSlug}`);
    }
  } else if (sizes.length === 1) {
    // if there is only one size of the product
    redirect(`/product/${productSlug}/${variantSlug}?size=${sizes[0].id}`);
  }

  return (
    <div>
      {productData?.name} - {productData?.variantName} - Price:
    </div>
  );
}
