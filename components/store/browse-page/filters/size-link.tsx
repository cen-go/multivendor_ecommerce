import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react"; // Icons

export default function SizeLink({ size }: { size: string }) {
  const searchParams = useSearchParams();
  const queryParams = new URLSearchParams(searchParams);

  const pathname = usePathname();

  const { replace } = useRouter();

  const sizeQueryArray = searchParams.getAll("size");

  const existedSize = sizeQueryArray.find((s) => s === size);

  const handleSizeChange = (size: string) => {
    if (existedSize) {
      // Remove only the specific size from params
      const newSizes = sizeQueryArray.filter((s) => s !== size);
      queryParams.delete("size"); // Delete all size params
      newSizes.forEach((size) => queryParams.append("size", size)); // Add back the remaining sizes
    } else {
      queryParams.append("size", size);
    }
    replaceParams();
  };

  const replaceParams = () => {
    replace(`${pathname}?${queryParams.toString()}`);
  };
  return (
    <label
      className="flex items-center text-left cursor-pointer whitespace-nowrap select-none"
      onClick={() => handleSizeChange(size)}
    >
      <span
        className={cn(
          "mr-2 border border-[#ccc] w-3.5 h-3.5 relative flex items-center justify-center rrounded-full",
          {
            "bg-orange-primary text-white border-orange-primary": size === existedSize,
          }
        )}
      >
        {size === existedSize && <Check className="w-3" />}
      </span>
      <div className="flex-1 text-sm inline-block overflow-visible text-clip whitespace-normal">
        {size}
      </div>
    </label>
  );
}
