// React & Next.js
import { notFound, redirect } from "next/navigation";
// Server actions, db queries
import { getProductPageData, getProducts } from "@/actions/product";
// Components
import ProductPageContainer from "@/components/store/product-page/container";
// UI components
import { Separator } from "@/components/ui/separator";
import RelatedProducts from "@/components/store/product-page/related-products";

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

  const { sizes, specs, questions, category } = productData;

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

  const relatedProducts = await getProducts({category: category.url});

  return (
    <div>
      <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden">
        <ProductPageContainer productData={productData} sizeId={sizeId}>
          {relatedProducts.products && (
            <>
              <Separator />
              {/* Related products */}
              <RelatedProducts products={relatedProducts.products} />
            </>
          )}
          <Separator className="mt-6" />
          {/* Product reviews */}
          <Separator className="mt-6" />
          {/* Product description */}
          {specs.productSpecs.length > 0 ||
            (specs.variantSpecs.length > 0 && (
              <>
                <Separator className="mt-6" />
                {/* Specs Table */}
              </>
            ))}
          {questions.length > 0 && (
            <>
              <Separator className="mt-6" />
              {/* Product Questions */}
            </>
          )}
          <Separator className="mt-6" />
          {/* Store Card */}
          {/* Store Products */}
        </ProductPageContainer>
      </div>
    </div>
  );
}
