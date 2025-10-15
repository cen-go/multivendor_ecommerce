"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfferTag } from "@prisma/client";
import OfferLink from "./offer-link";
import { useSearchParams } from "next/navigation";

export default function OfferFilter({ offers }: { offers: OfferTag[] }) {
  const searchParams = useSearchParams();
  const offerTagQuery = searchParams.get("offer");

  const [show, setShow] = useState<boolean>(!!offerTagQuery);
  return (
    <div className="pt-5 pb-4">
      {/* Header */}
      <div
        className="relative cursor-pointer flex items-center justify-between select-none"
        onClick={() => setShow((prev) => !prev)}
      >
        <h3 className="text font-bold overflow-ellipsis capitalize line-clamp-1 text-main-primary">
          Offer
        </h3>
        <span className="absolute right-0">
          {show ? <Minus className="w-3" /> : <Plus className="w-3" />}
        </span>
      </div>
      {/* Filter */}
      <div
        className={cn("mt-2.5 flex flex-wrap gap-2", {
          hidden: !show,
        })}
      >
        {offers.map((offer) => (
          <OfferLink key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
