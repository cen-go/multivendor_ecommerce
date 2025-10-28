import {  ProductType } from "@/lib/types";
import ProductCard from "../cards/product/product-card";

export default function StoreProducts({
  products,
}: {
  products: ProductType[];
}) {

  return (
    <div className=" bg-white justify-center md:justify-start flex flex-wrap p-2 pb-16 rounded-md">
      {products.map((product) => (
        <ProductCard key={product.id + product.slug} product={product} />
      ))}
    </div>
  );
}