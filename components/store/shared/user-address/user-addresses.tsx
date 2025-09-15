// React & Next.js
import { Dispatch, SetStateAction, useState } from "react";
// Types
import { UserShippingAddressType } from "@/lib/types";
import { Country, ShippingAddress } from "@prisma/client";
// Icons
import { PlusIcon } from "lucide-react";
// Components
import Modal from "../modal";
import AddressDetailsForm from "./address-details-form";
import AddressList from "./address-list";

interface Props {
  countries: Country[];
  addresses: UserShippingAddressType[];
  selectedAddress: ShippingAddress | undefined;
  setSelectedAddress: Dispatch<SetStateAction<ShippingAddress | undefined>>;
}

export default function UserAddresses({
  addresses,
  countries,
  selectedAddress,
  setSelectedAddress,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      {/* Modal */}
      <Modal title="Add new address" show={showModal} setShow={setShowModal}>
        <AddressDetailsForm countries={countries} setShowModal={setShowModal} />
      </Modal>
      <div className="w-full py-4 px-6 bg-white">
        <div className="relative flex flex-col text-sm">
          <h1 className="text-lg mb-3 font-bold">Shipping Addresses</h1>
          {addresses && addresses.length > 0 && (
            <AddressList
              addresses={addresses}
              countries={countries}
              setSelectedAddress={setSelectedAddress}
              selectedAddress={selectedAddress}
            />
          )}
          <div
            className="mt-4 ml-8 text-orange-background cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            <PlusIcon className="inline-block mr-1 w-3.5" />
            <span className="text-sm font-semibold">Add new address</span>
          </div>

          <div>{/* Address Detail */}</div>
        </div>
      </div>
    </>
  );
}
