import Image from "next/image";
import Link from "next/link";
// Types
import { SimpleProduct } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function ProductCardSimple({
  product,
}: {
  product: SimpleProduct;
}) {
  return (
    <Link href={`/product/${product.slug}?variant=${product.variantSlug}`}>
      <div className="w-[120px] h-[170px] relative flex flex-col rounded-md items-center justify-between p-2">
        <Image
          src={product.image}
          alt={`${product.name} - ${product.variantName} image`}
          width={200}
          height={200}
          className="min-h-[125px] max-h-[125px] object-cover rounded-md align-middle shadow-lg"
        />
        <div className="absolute bottom-6 mt-2 space-y-2">
          <div className="py-1.5 px-2 bg-[#ff4747] text-white font-bold text-sm rounded-lg">
            {formatCurrency(product.price)}
          </div>
        </div>
      </div>
    </Link>
  );
}