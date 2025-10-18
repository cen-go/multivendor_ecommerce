import { getHomeDataDynamic } from "@/actions/home";
import { getProducts } from "@/actions/product";
import ProductList from "@/components/store/shared/product-list";
import { ProductType } from "@/lib/types";

export default async function Home() {
  const productsData = await getProducts();

  const data = await getHomeDataDynamic([
    { property: "category", value: "sportswear", type: "full" },
    { property: "subcategory", value: "smart-watches", type: "full" },
  ]);
  const {products_sportswear} = data;
console.log(products_sportswear);

const newData = [...products_sportswear, ...data.products_smart_watches]

  return (
    <div className="p-12">
      <ProductList products={newData as ProductType[]} title="Trending Products" arrow/>
    </div>
  );
}
