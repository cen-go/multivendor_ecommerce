// React & Next.js
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
// Server actions, db queries, DB client
import db from "@/lib/db";
import { getProductPageData, getProducts } from "@/actions/product";
// Components
import ProductPageContainer from "@/components/store/product-page/container";
// UI components
import { Separator } from "@/components/ui/separator";
import RelatedProducts from "@/components/store/product-page/related-products";
import ProductDescription from "@/components/store/product-page/product-description";
import ProductSpecs from "@/components/store/product-page/product-specs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string; variantSlug: string }>;
}): Promise<Metadata> {
  const { productSlug, variantSlug } = await params;
  const productInfo = await db.product.findUnique({
    where: { slug: productSlug },
    select: {
      variants: {
        where: { slug: variantSlug },
        select: { variantName: true },
      },
      name: true,
      brand: true,
    },
  });

  return {
    title: `${productInfo?.brand} - ${productInfo?.name} - ${productInfo?.variants[0].variantName}`,
  };
}

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

  const { sizes, specs, questions, category, description, variantDescription } = productData;

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
      <div className="max-w-[1650px] mx-auto p-4 overflow-x-hidden lg:mt-4">
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
          <ProductDescription description={[description, variantDescription ?? ""]} />
          {/* Specs */}
          {(specs.productSpecs.length > 0 || specs.variantSpecs.length > 0) && (
              <>
                <Separator className="mt-6" />
                {/* Specs Table */}
                <ProductSpecs specs={specs} />
              </>
            )}
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
