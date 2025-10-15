import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { OfferTag } from "@prisma/client";

export default function OfferLink({ offer }: { offer: OfferTag }) {
  const searchParams = useSearchParams();
  const queryParams = new URLSearchParams(searchParams);

  const pathname = usePathname();

  const { replace } = useRouter();

  // Params
  const offerQuery = searchParams.get("offer");

  const handleOfferChange = (offer: string) => {
    if (offer === offerQuery) {
      queryParams.delete("offer");
      replaceParams();
      return;
    };
    queryParams.delete("offer");
    queryParams.set("offer", offer);
    replaceParams();
  };

  const replaceParams = () => {
    replace(`${pathname}?${queryParams.toString()}`);
  };
  return (
    <div
      className={cn(
        "border text-sm px-1.5 w-fit py-1 rounded-lg cursor-pointer hover:border-orange-background",
        {
          "bg-[#ffebed] text-orange-background border-orange-background":
            offer.url === offerQuery,
        }
      )}
      onClick={() => handleOfferChange(offer.url)}
    >
      {offer.name}
    </div>
  );
}
