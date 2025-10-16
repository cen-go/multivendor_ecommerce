"use client";
import { useCallback, useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductQueryFiltersType } from "@/lib/types";
import SizeLink from "./size-link";
import { getFilteredSizes } from "@/actions/product";

export default function SizeFilter({
  queries,
}: {
  queries: ProductQueryFiltersType;
}) {
  const sizeQuery =  queries.size;
  const { category, subcategory, offer } = queries;
  const [show, setShow] = useState<boolean>(!!sizeQuery);
  const [sizes, setSizes] = useState<{ size: string }[]>([]);


  const handleGetSizes = useCallback(async () => {
    const sizes = await getFilteredSizes({ category, offer, subcategory });
    setSizes(sizes.sizes);
  }, [category, subcategory, offer]);

  useEffect(() => {
    handleGetSizes();
  }, [handleGetSizes]);

  return (
    <div className="pt-5 pb-4">
      {/* Header */}
      <div
        className="relative cursor-pointer flex items-center justify-between select-none"
        onClick={() => setShow((prev) => !prev)}
      >
        <h3 className="font-bold overflow-ellipsis capitalize line-clamp-1 text-main-primary">
          Size
        </h3>
        <span className="absolute right-0">
          {show ? <Minus className="w-3" /> : <Plus className="w-3" />}
        </span>
      </div>
      {/* Filter */}
      <div
        className={cn("mt-2.5 space-y-2", {
          hidden: !show,
        })}
      >
        {sizes.map((size) => (
          <SizeLink key={size.size} size={size.size} />
        ))}
      </div>
    </div>
  );
}