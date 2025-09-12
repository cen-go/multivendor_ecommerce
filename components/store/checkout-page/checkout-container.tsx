"use client"

import { CartWithCartItemsType, UserShippingAddressType } from "@/lib/types"
import { Country, ShippingAddress } from "@prisma/client";
import UserAddresses from "../shared/user-addresses";
import CountryNote from "../shared/country-note";
import { useState } from "react";

interface Props {
  cart: CartWithCartItemsType;
  countries: Country[];
  addresses: UserShippingAddressType[]
}

export default function CheckoutContainer({cart, countries, addresses}: Props) {
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress>()

  const addressCountry = countries.find(c => c.id === selectedAddress?.countryId)
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
        {selectedAddress && (
          <CountryNote userCountry={addressCountry} />
        )}
        {/* Checkout Table */}
      </div>
      {/* Place order card */}
    </div>
  );
}
