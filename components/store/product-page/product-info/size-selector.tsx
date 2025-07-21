"use client"

// React & Next.js
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// Types
import { Size } from "@prisma/client"
import { cn } from "@/lib/utils";

interface Props {
  sizes: Size[];
  sizeId: string | undefined;
}

export default function SizeSelector({sizes, sizeId}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams);

  function handleSelectSize(sizeId: string) {
    newSearchParams.set("size", sizeId);
    router.replace(`${ pathname}?${newSearchParams.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {sizes.map((size) => (
        <div
          key={size.id}
          onClick={() => handleSelectSize(size.id)}
          className={cn(
            "px-4 py-1 border rounded-xl cursor-pointer hover:border-gray-700",
            {
              "border-orange-border-dark border-2": sizeId === size.id,
            }
          )}
        >
          {size.size}
        </div>
      ))}
    </div>
  );
}
