import { UserShippingAddressType } from "@/lib/types"
import { cn } from "@/lib/utils";
import { Country } from "@prisma/client";
import { CheckIcon } from "lucide-react";
import { useState } from "react";
import Modal from "../shared/modal";
import AddressDetailsForm from "../shared/user-address/address-details-form";
import { upsertUserAddress } from "@/actions/user";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  address: UserShippingAddressType;
  isSelected: boolean;
  onSelect: () => void;
  countries: Country[];
}

export default function AddressCard({address, countries, isSelected, onSelect}: Props) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  async function handleSetDefault() {
    const response = await upsertUserAddress({
      ...address,
      default:true,
    });
    if (response.success) {
      toast.success(`Address "${address.title}" has been set as default address.`);
      router.refresh();
    } else {
      toast.error(response.message);
    }
  }

  return (
    <>
      <Modal show={showModal} setShow={setShowModal} title="Edit Address">
        <AddressDetailsForm
          countries={countries}
          setShowModal={setShowModal}
          data={address}
        />
      </Modal>
      <div className="w-full relative flex self-start group">
        {/* Checkbox */}
        <label
          htmlFor={address.id}
          className="p-0 text-gray-900 text-sm leading-6 inline-flex items-center mr-3 cursor-pointer"
          onClick={onSelect}
        >
          <span className="leading-8 inline-flex p-0.5 cursor-pointer">
            <span
              className={cn(
                "leading-8 inline-block w-5 h-5 rounded-full bg-white border border-gray-300",
                {
                  "bg-orange-background border-none flex items-center justify-center":
                    isSelected,
                }
              )}
            >
              {isSelected && <CheckIcon className="stroke-white w-3" />}
            </span>
          </span>
          <input type="checkbox" id={address.id} hidden />
        </label>
        {/* Address */}
        <div className="w-full border-t pt-2">
          {/* Full name - Phone number */}
          <div className="flex max-w-[328px] overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="mr-4 text-sm text-black font-semibold capitalize">
              {address.title} - {address.firstName} {address.lastName}
            </span>
            <span>{address.phone}</span>
          </div>
          {/* Address 1 - Address 2 */}
          <div className="text-sm max-w-[90%] text-gray-600 leading-4 overflow-hidden text-ellipsis whitespace-nowrap">
            {address.address1}
            {address.address2 && `, ${address.address2}`}
          </div>
          {/* City - Country - Zipcode */}
          <div className="text-sm max-w-[90%] text-gray-600 leading-4 overflow-hidden text-ellipsis whitespace-nowrap">
            {address.city}, {address.country.name},&nbsp;
            {address.zip_code}
          </div>
          {/* Save as default - Edit */}
          <div className="absolute right-0 top-1/2 flex items-center gap-x-3 text-sm">
            {isSelected && !address.default && (
              <div
                className="cursor-pointer text-orange-background hover:underline"
                onClick={handleSetDefault}
              >
                Save as default
              </div>
            )}
            <div
              onClick={() => setShowModal(true)}
              className="  text-[#27f] cursor-pointer hover:underline"
            >
              Edit
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
