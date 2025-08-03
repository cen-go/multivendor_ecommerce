import { cn } from "@/lib/utils";
import { Spec } from "@prisma/client";

interface Props {
  specs: {
    productSpecs: Spec[];
    variantSpecs: Spec[];
  };
}

export default function ProductSpecs({
  specs: { productSpecs, variantSpecs },
}: Props) {
  return (
    <div className="pt-6">
      {/* Title */}
      <div className="h-12">
        <h2 className="text-main-primary text-2xl font-bold">Specifications</h2>
      </div>
      {/* Product Specs Table */}
      <SpecTable data={productSpecs} />
      {/* Variant Specs Table */}
      <SpecTable data={variantSpecs} />
    </div>
  );
}

const SpecTable = ({
  data,
  noTopBorder,
}: {
  data: Spec[];
  noTopBorder?: boolean;
}) => {
  return (
    <ul className="border-b border-x grid xl:grid-cols-2">
      {data.map((spec) => (
        <li
          key={spec.id}
          className={cn(
            "border-t grid grid-cols-2 xl:border-r text-main-primary",
            {
              "border-t-0": noTopBorder,
            }
          )}
        >
          <div className="bg-gray-50 px-4 py-2 flex items-center">
            {spec.name}
          </div>
          <div className="px-4 py-2  flex items-center">{spec.value}</div>
        </li>
      ))}
    </ul>
  );
};
