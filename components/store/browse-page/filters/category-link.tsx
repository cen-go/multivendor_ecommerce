// React & Next.js
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// Types
import { CategoryWithSubsType } from "@/lib/types";
// Icons
import { Minus, Plus } from "lucide-react";

export default function CategoryLink({
  category,
}: {
  category: CategoryWithSubsType;
}) {
  const searchParams = useSearchParams();
  const queryParams = new URLSearchParams(searchParams);

  const pathname = usePathname();

  const { replace } = useRouter();

  // Params
  const categoryQuery = searchParams.get("category");
  const subcategoryQuery = searchParams.get("subcategory");

  const [expand, setExpand] = useState<boolean>(false);

  const handleCategoryChange = (category: string) => {
    if (category === categoryQuery) {
      queryParams.delete("category");
      queryParams.delete("subcategory");
      replaceParams();
      setExpand(false);
      return;
    }
    queryParams.delete("subCategory");
    queryParams.set("category", category);
    replaceParams();
  };

  const handleSubCategoryChange = (sub: string) => {
    if (category.url !== categoryQuery) queryParams.set("category", category.url);
    if (sub === subcategoryQuery) {
      queryParams.delete("subcategory");
    } else {
      queryParams.set("subcategory", sub);
    }
    replaceParams();
  };

  const replaceParams = () => {
    replace(`${pathname}?${queryParams.toString()}`);
    setExpand(true);
  };
  return (
      <section>
        <div className="mt-2 leading-5 relative w-full flex items-center justify-between">
          <label
            htmlFor={category.id}
            className="flex items-center text-left cursor-pointer whitespace-nowrap select-none"
            onClick={() => handleCategoryChange(category.url)}
          >
            <span className="mr-2 border border-[#ccc] w-4 h-4 rounded-full relative grid place-items-center">
              {category.url === categoryQuery && (
                <div className="h-2.5 w-2.5 inline-block bg-orange-primary rounded-full"></div>
              )}
            </span>
            <div className="flex-1 text-sm inline-block overflow-visible text-clip whitespace-normal">
              {category.name}
            </div>
          </label>
          <span
            className="cursor-pointer"
            onClick={() => setExpand((prev) => !prev)}
          >
            {expand ? <Minus className="w-3" /> : <Plus className="w-3" />}
          </span>
        </div>
        {expand && (
          <>
            {category.subCategories.map((sub) => (
              <section key={sub.id} className="pl-5 mt-2 leading-5 relative">
                <label
                  htmlFor={sub.id}
                  className="w-full flex items-center text-left cursor-pointer whitespace-nowrap select-none"
                  onClick={() => handleSubCategoryChange(sub.url)}
                >
                  <span className="mr-2 border border-[#ccc] w-3 h-3 rounded-full relative grid place-items-center">
                    {sub.url === subcategoryQuery && (
                      <div className="h-1.5 w-1.5 inline-block bg-orange-primary rounded-full"></div>
                    )}
                  </span>
                  <div className="flex-1 text-sm inline-block overflow-visible text-clip whitespace-normal">
                    {sub.name}
                  </div>
                </label>
              </section>
            ))}
          </>
        )}
      </section>
  );
}
