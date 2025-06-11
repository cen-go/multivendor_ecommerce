// React Next.js
import Image from "next/image";
// Placeholder image to show when no images are uploaded
import NoProductImage from "@/public/assets/images/no_image.png"
import { cn } from "@/lib/utils";

interface ImagesPreviewGridProps {
  images: {url: string}[];
  onRemove: (value: string) => void;
}

export default function ImagesPreviewGrid({
  images,
  onRemove,
}: ImagesPreviewGridProps) {
  console.log(images, images.length, typeof images.length);
  // Map image count to Tailwind grid-cols class (supports up to 6 images)
  const gridCols =
    {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }[images.length] || "grid-cols-2"; // fallback

  // If there are no images, display a placeholder image
  if (images.length === 0) {
    return (
      <div>
        <Image
          src={NoProductImage}
          alt="No images available."
          height={200}
          className="rounded-md"
        />
      </div>
    );
  }

  // If there are images, display images in a grid
  return (
    <div className="max-w-4xl">
      <div className={cn(`grid gap-2 h-max-[300px] overflow-hidden rounded-md`, gridCols)}>
        {images.map((i) => (
          <div
            key={i.url}
            className={cn(
              "relative group h-full border-2 rounded-md bg-slate-100/20 border-slate-300 overflow-hidden"
            )}
          >
            <Image
              src={i.url}
              alt="Product image"
              width={300}
              height={300}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
