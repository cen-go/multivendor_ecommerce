import { ProductType } from "@/lib/types";
import ProductList from "../shared/product-list";

export default function RelatedProducts({products}: {products: ProductType[]}) {
  return (
    <div className="mt-1 space-y-1 px-4">
      <ProductList products={products} title="Related Products" />
    </div>
  )
}
