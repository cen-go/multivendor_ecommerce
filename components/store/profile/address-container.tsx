"use client";

import { useState } from "react";
import { UserShippingAddressType } from "@/lib/types";
import { Country } from "@prisma/client";
import UserAddresses from "../shared/user-address/user-addresses";

interface Props {
  addresses: UserShippingAddressType[];
  countries: Country[];
}

export default function ProfileAddressesContainer({ addresses, countries }: Props) {
  const [selectedAddress, setSelectedAddress] = useState<UserShippingAddressType | undefined>();
  return (
    <div className="w-full">
      <UserAddresses
        addresses={addresses}
        countries={countries}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
      />
    </div>
  );
};