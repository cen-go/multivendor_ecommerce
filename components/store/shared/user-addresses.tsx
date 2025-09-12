import { UserShippingAddressType } from "@/lib/types";
import { Country, ShippingAddress } from "@prisma/client";
import { PlusIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  countries: Country[];
  addresses: UserShippingAddressType[];
  selectedAddress: ShippingAddress | undefined;
  setSelectedAddress: Dispatch<SetStateAction<ShippingAddress |undefined>>
}

export default function UserAddresses({addresses, countries, selectedAddress, setSelectedAddress}: Props) {
  return (
    <div className="w-full py-4 px-6 bg-white">
      <div className="relative flex flex-col text-sm">
        <h1 className="text-lg mb-3 font-bold">Shipping Addresses</h1>
        {addresses && addresses.length > 0 && (
          <div>Addresses List</div>
        )}
        <div className="mt-4 ml-8 text-orange-background cursor-pointer">
          <PlusIcon className="inline-block mr-1 w-3.5" />
          <span className="text-sm font-semibold">Add new address</span>
        </div>
        {/* Modal */}
        <div>
          {/* Address Detail */}
        </div>
      </div>
    </div>
  );
}
