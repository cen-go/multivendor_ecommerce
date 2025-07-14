import { getProducts } from "@/actions/product";
import ProductList from "@/components/store/shared/product-list";

export default async function Home() {
  const productsData = await getProducts();

  return (
    <div className="p-12">
      <ProductList products={productsData.products} title="Trending Products" arrow/>
    </div>
  );
}
