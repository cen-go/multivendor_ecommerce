"use client";

// React & Next.js
import Image from "next/image";
import { useState } from "react";
// Utils
import { cn } from "@/lib/utils";
// Types
import { ProductVariantImage } from "@prisma/client";

import ImageZoom from "react-image-zooom";

export default function ProductImageSwiper({
  images,
}: {
  images: ProductVariantImage[];
}) {
  const [activeImage, setActiveImage] = useState<ProductVariantImage>(
    images[0]
  );

  return (
    <div className="relative">
      <div className="relative w-full flex flex-col lg:flex-row gap-2">
        {/* Thumbnails */}
        <div className="flex flex-wrap lg:flex-col gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              onMouseEnter={() => setActiveImage(img)}
              onTouchStart={() => setActiveImage(img)}
              className={cn(
                "w-16 h-16 rounded-md grid place-items-center overflow-hidden border border-gray-200 cursor-pointer transition-all duration-75 ease-in",
                {
                  "border-orange-border-dark border-2":
                    activeImage.id === img.id,
                }
              )}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={80}
                height={80}
                className="object-cover rounded-md"
              />
            </div>
          ))}
        </div>
        {/* Main Image */}
        <div className="relative rounded-lg overflow-hidden w-full lg:h-[600px] lg:w-[600px]">
          <ImageZoom src={activeImage.url} alt={activeImage.alt} className="!w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
