import { CartProductType } from "@/lib/types"
import { cn } from "@/lib/utils";
import { ShippingFeeMethod } from "@prisma/client";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import Image from "next/image";

interface Props {
  product: CartProductType;
  selectedItems: CartProductType[];
  setSelectedItems: Dispatch<SetStateAction<CartProductType[]>>;
  setTotalShipping: Dispatch<SetStateAction<number>>;
}

export default function CartProduct({product, selectedItems, setSelectedItems,setTotalShipping}: Props) {
  const {
    productId,
    variantId,
    sizeId,
    name,
    variantName,
    brand,
    image,
    price,
    quantity,
    size,
    shippingFee,
    shippingMethod,
    shippingService,
    extraShippingFee,
    weight,
    productSlug,
    variantSlug,
  } = product;

  const uniqueId = `${productId}-${variantId}-${sizeId}`;
  const [shippingInfo, setShippingInfo] = useState({
    initialFee: 0,
    extraFee: 0,
    totalFee: 0,
    weight,
    method: shippingMethod,
    shippingService,
  });

  // Function to calculate shipping fee
  const calculateShippingFee = useCallback(() => {
    let initialFee= 0;
    let extraFee= 0;
    let totalFee= 0;

    if (shippingMethod === ShippingFeeMethod.ITEM) {
      initialFee = shippingFee;
      extraFee = quantity > 1 ? extraShippingFee * quantity : 0;
      totalFee = initialFee + extraFee;
    } else if (shippingMethod === ShippingFeeMethod.WEIGHT) {
      totalFee = shippingFee * (weight ?? 0) * quantity;
    } else if (shippingMethod === ShippingFeeMethod.FIXED) {
      totalFee = shippingFee;
    }

    // Subtract the previous shipping total for this product before updating
    setTotalShipping(prevTotal => prevTotal - shippingInfo.totalFee + totalFee);

    // Update the state
    setShippingInfo({
      initialFee,
      extraFee,
      totalFee,
      weight,
      method: shippingMethod,
      shippingService,
    });
  }, [shippingFee,extraShippingFee,weight, shippingMethod, shippingService, setTotalShipping, shippingInfo.totalFee, quantity]);

  useEffect(() => calculateShippingFee(), [quantity, calculateShippingFee]);

  // Check if the product selected or not
  const selected = selectedItems.some(
    (item) =>
      item.productId === product.productId &&
      item.variantId === product.variantId &&
      item.sizeId === product.sizeId
  );

  function handleSelect() {
    if (selected) {
      setSelectedItems((prevItems) =>
        prevItems.filter(
          (item) =>
            !(
              item.productId === product.productId &&
              item.variantId === product.variantId &&
              item.sizeId === product.sizeId
            )
        )
      );
    } else {
      setSelectedItems((prevItems) => [...prevItems, product]);
    }
  }

  return (
    <div className="bg-white px-6 border-t bordet-t-[#ebebeb] select-none flex py-4">
      <div className="relative flex self-start">
        {/* Image */}
        <div className="flex items-center">
          <label
          htmlFor={uniqueId}
          className="p-0 text-gray-900 text-sm leading-6 list-none inline-flex items-center m-0 mr-2 cursor-pointer align-middle"
        >
          <span className="leading-8 inline-flex p-0.5 cursor-pointer">
            <span
              className={cn(
                "leading-8 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:border-orange-background",
                {
                  "border-orange-background": selected,
                }
              )}
            >
              {selected && (
                <span className="bg-orange-background  w-5 h-5 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-3.5 text-white mt-0.5" />
                </span>
              )}
            </span>
          </span>
          <input type="checkbox" id={uniqueId} hidden onChange={handleSelect} />
        </label>
        <Link
              href={`/product/${productSlug}/${variantSlug}?size=${sizeId}`}
            >
              <div className="m-0 mr-4 ml-2 w-28 h-28 relative rounded-lg">
                <Image
                  src={image}
                  alt={name}
                  height={150}
                  width={150}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
            </Link>
      <div>{product.brand} - {product.name}</div>
        </div>
      </div>
    </div>
  );
}
