import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Variant{
    variantUrl: string;
    image: string;
    variantSlug: string;
    variantName: string;
};

interface Props {
  variants: Variant[];
  currentVariantSlug: string;
}

export default function ProductVariantSelector({variants, currentVariantSlug}: Props) {
  return (
    <div className="flex items-center flex-wrap gap-2">
      {variants.map((variant) => (
        <Link href={variant.variantUrl} key={variant.variantSlug}>
          <div
            className={cn(
              "w-14 h-14 rounded-full grid place-items-center p-0.5 overflow-hidden border cursor-pointer transition-all duration-100 ease-in",
              {
                "border-orange-border-dark border-2":
                  variant.variantSlug === currentVariantSlug,
              }
            )}
            aria-label={`product variant ${variant.variantName}`}
          >
            <Image
              src={variant.image}
              alt={`product variant ${variant.variantName}`}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
