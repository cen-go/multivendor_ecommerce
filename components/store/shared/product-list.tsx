import { ProductType } from "@/lib/types"
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "../cards/product/product-card";

interface Props {
  products: ProductType[];
  title?: string;
  link?: string;
  arrow?: boolean;
}

export default function ProductList({products, title, link, arrow}: Props) {
  const Title = () => {
    if (link) {
      return (
        <Link href={link} className="h-12">
          <h1 className="text-main-primary text-xl font-bold">
            {title}&nbsp;
            {arrow && <ChevronRight className="w-4 inline-block" />}
          </h1>
        </Link>
      );
    } else {
      return (
        <h2 className="text-main-primary text-xl font-bold">
          {title}&nbsp;{arrow && <ChevronRight className="w-4 inline-block" />}
        </h2>
      );
    }
  };

  return (
    <div className="relative">
      {title && <Title />}
      {products.length > 0 ? (
        <div
          className={cn(
            "flex flex-wrap  -translate-x-5 w-[calc(100%+3rem)] sm:w-[calc(100%+1.5rem)]", 
            {"mt-2": title}
          )}
        >
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p>No Products...</p>
      )}
    </div>
  );
}
