import { CartProductType } from "@/lib/types"
import { cn, formatCurrency } from "@/lib/utils";
import { ShippingFeeMethod } from "@prisma/client";
import { CheckIcon, ChevronRight, HeartIcon, MinusIcon, PlusIcon, Trash2Icon, TruckIcon } from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";

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
      extraFee = quantity > 1 ? extraShippingFee * (quantity - 1) : 0;
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

  // Get the cart updating methods from state
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateProductQuantity = useCartStore(state => state.updateProductQuantity);

  function handleRemoveItemFtomCart() {
    removeFromCart(product);
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
    }
  }

  function handleDecreaseQuantity() {
    if (quantity > 1) {
      updateProductQuantity(product, quantity - 1);
    } else {
      return;
    }
  }

  function handleIncreaseQuantity() {
    if (quantity >= product.stock) {
      return;
    } else {
      updateProductQuantity(product, quantity + 1);
    }
  }

  return (
    <div className="bg-white px-6 border-t bordet-t-[#ebebeb] select-none py-4">
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
            <input
              type="checkbox"
              id={uniqueId}
              hidden
              onChange={handleSelect}
            />
          </label>
          <Link href={`/product/${productSlug}/${variantSlug}?size=${sizeId}`}>
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
        </div>
        {/* info */}
        <div className="min-w-0 flex-1">
          {/* Title - Actions */}
          <div className="w-[calc(100%-48px)] flex items-start">
            <Link
              href={`/product/${productSlug}/${variantSlug}?size=${sizeId}`}
              className="inline-block text-sm"
            >
              {brand} - {product.name} - {variantName}
            </Link>
            <div className="absolute top-0 right-0">
              <span className="mr-2.5 cursor-pointer inline-block">
                <HeartIcon className="w-5 hover:stroke-orange-secondary" />
              </span>
              <span
                className="mr-2.5 cursor-pointer inline-block"
                onClick={handleRemoveItemFtomCart}
              >
                <Trash2Icon className="w-5 hover:stroke-orange-secondary" />
              </span>
            </div>
          </div>
          {/* Style - Size */}
          <div className="my-1">
            <button className="flex items-center justify-between flex-wrap text-main-primary relative h-[24px] bg-gray-100 whitespace-normal px-2.5 py-0 max-w-full text-xs leading-4 rounded-xl font-bold cursor-pointer  outline-0">
              <div className="text-left inline-block overflow-hidden text-ellipsis whitespace-nowrap max-w-[95%]">
                {size}
              </div>
              <span className="ml-0.5">
                <ChevronRight className="w-3" />
              </span>
            </button>
          </div>
          {/* Price - Delivery */}
          <div className="flex items-center justify-between mt-2 relative">
            <div className="inline-block break-all">
              {formatCurrency(price)}
            </div>
            {/* Quantity Changer */}
            <div className="text-gray-900 text-sm leading-6 list-none inline-flex items-center">
              <div
                onClick={handleDecreaseQuantity}
                className="w-6 h-6 text-xs bg-gray-100 hover:bg-gray-200 leading-6 grid place-items-center rounded-full cursor-pointer"
              >
                <MinusIcon className="w-3 stroke-[#555]" />
              </div>
              <input
                type="text"
                value={quantity}
                min={1}
                max={product.stock}
                readOnly
                className="m-1 h-6 w-[32px] bg-transparent border-none leading-6 tracking-normal text-center outline-none text-gray-900 font-bold"
              />
              <div
                onClick={handleIncreaseQuantity}
                className="w-6 h-6 text-xs bg-gray-100 hover:bg-gray-200 leading-6 grid place-items-center rounded-full cursor-pointer"
              >
                <PlusIcon className="w-3 stroke-[#555]" />
              </div>
            </div>
          </div>
          {/* Shipping Info */}
          <div className="flex items-center my-1 text-xs text-[#999] cursor-pointer">
            <TruckIcon className="w-4 inline-block text-green-600" />
            {shippingInfo.totalFee > 0 ? (
              <span className="text-green-600 ml-1">
                {shippingMethod === ShippingFeeMethod.ITEM ? (
                  <>
                    {formatCurrency(shippingInfo.initialFee)} {quantity > 1 && "first item"}{" "}
                    {quantity > 1 && (
                      <span>
                        + ({quantity - 1} {quantity > 2 ? "pieces" : "piece"}) x {formatCurrency(extraShippingFee)} ={" "}
                        {formatCurrency(shippingInfo.totalFee)}
                      </span>
                    )}
                  </>
                ) : shippingMethod === ShippingFeeMethod.WEIGHT ? (
                  <>
                    {formatCurrency(shippingInfo.initialFee)} x {weight ?? 0}kg x{" "}
                    {quantity} {quantity > 1 ? "items" : "item"} ={" "}
                    {formatCurrency(shippingInfo.totalFee)}
                  </>
                ) : (
                  <>{formatCurrency(shippingInfo.totalFee)}</>
                )}
              </span>
            ) : (
              <span className="text-green-600 ml-1">Free Delivery</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
