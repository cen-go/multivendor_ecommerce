import { cn } from "@/lib/utils";
import { OfferTag } from "@prisma/client";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

export default function OfferTagsLinks({offerTags}: {offerTags: OfferTag[]}) {
  const isPhoneScreen = useMediaQuery({ query: "(max-width: 640px)" });
  const isSmallScreen = useMediaQuery({ query: "(min-width: 640px)" });
  const isMediumScreen = useMediaQuery({ query: "(min-width: 768px)" });
  const isLargeScreen = useMediaQuery({ query: "(min-width: 1024px)" });
  const isXLargeScreen = useMediaQuery({ query: "(min-width: 1280px)" });
  const is2XLargeScreen = useMediaQuery({ query: "(min-width: 1536px)" });

  let splitPoint = 1;
  if (is2XLargeScreen) splitPoint = 8;
  else if (isXLargeScreen) splitPoint = 6;
  else if (isLargeScreen) splitPoint = 6;
  else if (isMediumScreen) splitPoint = 4;
  else if (isSmallScreen) splitPoint = 3;
  else if (isPhoneScreen) splitPoint = 2;

  return (
    <div className="relative w-fit">
      <div className="flex items-center flex-wrap xl:-translate-x-4 transition-all ease-in-out">
        {offerTags.slice(0, splitPoint).map((tag, index) => (
          <Link
            href={`/browse?offer=${tag.url}`}
            key={tag.id}
            className={cn("font-bold text-center text-white px-4 leading-10 rounded-[20px] hover:bg-[#ffffff33]", {
              "text-orange-primary": index === 0,
            })}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}