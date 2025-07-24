import { cn, formatCurrency } from "@/lib/utils";

export interface SimplifiedSize {
  id: string;
  size: string;
  quantity: number;
  price: number;
  discount: number;
}

interface Props {
  sizeId: string | undefined;
  sizes: SimplifiedSize[];
  isCard?: boolean;
}

export default function ProductPrice({sizeId, sizes, isCard}: Props) {

  if (!sizes || sizes.length === 0) {
    // if no sizes are aveilable return and stop executing the component
    return;
  }

  // If no sizeId passed, calculate a price range for all the sizes available
  if (!sizeId) {
    const discountedPrices = sizes.map(
      (size) => Math.round(size.price * (1 - size.discount / 100))
    );

    const totalQuantity = sizes.reduce(
      (total, size) => total + size.quantity,
      0
    );

    const minPrice = Math.min(...discountedPrices);
    const maxPrice = Math.max(...discountedPrices);

    // If all the prices are the same, show a single price instead of range
    const priceToDisplay =
      minPrice === maxPrice
        ? formatCurrency(minPrice)
        : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

    return (
      <div>
        <div className="font-bold text-orange-primary inline-block mr-2.5">
          <span
            className={cn("inline-block text-4xl text-nowrap", {
              "text-lg": isCard,
            })}
          >
            {priceToDisplay}
          </span>
        </div>
        {!isCard && (
          <>
            <div className="text-orange-background text-xs leading-4 mt-1">
              <p>Note: Select a size to see the exact price</p>
            </div>
            <p className="mt-2 text-xs">{totalQuantity} pieces</p>
          </>
        )}
      </div>
    );
  }

  // If sizeId passed , find the specific size and display it's details
  const selectedSize = sizes.find(size => sizeId === size.id);

  if (!selectedSize) return <div></div>;

  // Calculate the price after discount if there is an active discount
  const discountedPrice = Math.round(selectedSize.price * (1 - selectedSize.discount / 100));

  return (
    <div>
      <div className="font-bold text-orange-primary inline-block mr-2.5">
        <span
          className={cn("inline-block text-4xl text-nowrap", {
            "text-lg": isCard,
          })}
        >
          {formatCurrency(discountedPrice)}
        </span>
      </div>
      {selectedSize.price !== discountedPrice && (
        <span className="inline-block text-xl font-normal text-gray-400 mr-2 line-through">
          {formatCurrency(selectedSize.price)}
        </span>
      )}
      {selectedSize.discount > 0 && (
        <span className="inline-block text-orange-secondary text-xl">
          {selectedSize.discount}% off
        </span>
      )}
      <p className="mt-2 text-xs">{selectedSize.quantity} pieces</p>
    </div>
  );
}
