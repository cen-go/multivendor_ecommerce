// React Next.js
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
// Placeholder image to show when no images are uploaded
import NoProductImage from "@/public/assets/images/no_image.png"
// Utility functions
import { cn, getCloudinaryPublicId, getDominantColors } from "@/lib/utils";
// Shadcn components
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// Server actions
import { deleteCloudinaryImage } from "@/actions/cloudinary";
// Icons
import { X } from "lucide-react";
import ColorPalette from "./color-palette";

interface ImagesPreviewGridProps {
  images: {url: string}[];
  onRemove: (value: string) => void;
  colors?: {color: string}[]; // List of colors from form
  setColors: Dispatch<SetStateAction<{color: string}[]>>; // Setter fn for colors
}

export default function ImagesPreviewGrid({
  images,
  onRemove,
  colors,
  setColors,
}: ImagesPreviewGridProps) {

  async function handleRemove(imageUrl: string) {
    const publicId = getCloudinaryPublicId(imageUrl);
    const result = await deleteCloudinaryImage(publicId);
    if (result.success) {
      onRemove(imageUrl); // delete from UI and local state
    } else {
      toast.error(result.message);
    }
  }

  // Extract image colors
  const [ colorPalettes, setColorPalettes ] = useState<string[][]>([]);

  useEffect(() => {
    async function fetchColors() {
      const palettes = await Promise.all(
        images.map(async (img) => {
          try {
            const colors = await getDominantColors(img.url);
            return colors;
          } catch {
            return [];
          }
        })
      );
      setColorPalettes(palettes);
    }

    if (images.length > 0) {
      fetchColors();
    }
  }, [images]);

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
      <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-md">
        {images.map((img, index) => (
          // Single preview image container
          <div
            key={img.url}
            className={cn(
              "relative h-full h-min-[150px] border-2 rounded-md bg-slate-100/20 border-slate-300 overflow-hidden"
            )}
          >
            {/* Delete image btn */}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleRemove(img.url)}
                  className="absolute z-10 !text-white top-2 right-2 rounded-full text-xs w-8 h-8 font-semibold bg-red-800 hover:bg-red-700"
                >
                  <X />
                </Button>
            {/* Preview image */}
            <Image
              src={img.url}
              alt="Product image"
              width={300}
              height={300}
              className="w-full h-full object-contain"
            />
            {/* Actions */}
            <div className={cn("absolute top-0 right-0 bottom-0 left-0 bg-white/55 items-center flex justify-center gap-y-3 transition-all duration-500")}>
              {/* Color palette (extract color) */}
              <ColorPalette colors={colors} extractedColors={colorPalettes[index]} setColors={setColors}  />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
