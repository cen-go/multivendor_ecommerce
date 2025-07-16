import { VariantImageType, VariantSimplified } from "@/lib/types"
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

interface Props {
  images: VariantImageType[];
  variants: VariantSimplified[];
  selectedVariant: VariantSimplified;
  setVariant: Dispatch<SetStateAction<VariantSimplified>>
};

export default function VariantSwitcher({images, variants, selectedVariant, setVariant}: Props) {
  return (
    <div>
      {variants.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {images.map((img, index) => (
            <div
              key={img.imageUrl}
              onClick={() => setVariant(variants[index])}
              className={cn(
                "p-0.5 rounded-full border-2 border-transparent overflow-hidden cursor-pointer",
                {"border-orange-border-dark": variants[index] === selectedVariant}
              )}
            >
              <Image
                src={img.imageUrl}
                alt=""
                height={100}
                width={100}
                className="w-8 h-8 object-cover rounded-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
