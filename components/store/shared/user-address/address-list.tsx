import { Dispatch, SetStateAction, useEffect } from "react";
// Types
import { UserShippingAddressType } from "@/lib/types";
import { Country } from "@prisma/client";
//Components
import AddressCard from "@/components/store/cards/address-card";

interface Props {
  addresses: UserShippingAddressType[];
  countries: Country[];
  selectedAddress: UserShippingAddressType | undefined;
  setSelectedAddress: Dispatch<SetStateAction<UserShippingAddressType | undefined>>;
}

export default function AddressList({
  addresses,
  countries,
  selectedAddress,
  setSelectedAddress,
}: Props) {
  useEffect(() => {
    const defaultAddress = addresses.find(add => add.default);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress)
    }
  }, [addresses, setSelectedAddress]);

  function handleSelect(address:UserShippingAddressType) {
    setSelectedAddress(address)
  }

  return (
    <div className="space-y-5 max-h-80 overflow-y-auto">
      {addresses.map((adr) => (
        <AddressCard
          key={adr.id}
          address={adr}
          countries={countries}
          isSelected={selectedAddress?.id === adr.id}
          onSelect={() => {handleSelect(adr)}}
        />
      ))}
    </div>
  );
}
