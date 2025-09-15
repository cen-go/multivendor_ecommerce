"use client"

import { CartWithCartItemsType, UserShippingAddressType } from "@/lib/types"
import { Country, ShippingAddress } from "@prisma/client";
import UserAddresses from "../shared/user-address/user-addresses";
import { useState } from "react";
import CheckoutProductCard from "../cards/checkout-product-card";
import PlaceOrderCard from "../cards/place-order-card";

interface Props {
  cart: CartWithCartItemsType;
  countries: Country[];
  addresses: UserShippingAddressType[]
}

export default function CheckoutContainer({cart, countries, addresses}: Props) {
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress>();

  return (
    <div className="w-full flex flex-col gap-y-2 lg:flex-row">
      <div className="space-y-2 lg:flex-1">
        {/* Address */}
        <UserAddresses
          addresses={addresses}
          countries={countries}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
        />
        {/* country note */}
        {/* Checkout Table */}
        <div className="py-4 my-3">
          {cart.cartItems.map((product) => (
            <CheckoutProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      {/* Place order card */}
      <PlaceOrderCard
        cartId={cart.id}
        selectedAddress={selectedAddress}
        shippingFees={cart.shippingFees}
        subtotal={cart.subtotal}
        total={cart.total}
      />
    </div>
  );
}
